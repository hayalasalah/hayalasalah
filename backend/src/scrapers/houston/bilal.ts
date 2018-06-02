// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Browser, Page } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import { getAdhanTimes } from "../../utils/adhanUtil";
import { jsDateToDateTime } from "../../utils/time";
import {
  abortMediaRequests,
  getDataForXPath,
  stringToDateTime
} from "../utils";

const getXPath = (i: number) =>
  `//*[@id="wsite-content"]/div[2]/div/div/table/tbody/tr/td[2]/div[1]/font/strong[${i}]/font`;

function getTimeString(prayerAndTimeString: string): string {
  const [, hour, minute] = prayerAndTimeString.split(":", 3);
  return `${hour}:${minute}`.trim();
}

async function getTime(
  page: Page,
  index: number,
  isFajr: boolean
): Promise<Prayer> {
  const timeData = await getDataForXPath(page, getXPath(index));
  const timeString = getTimeString(timeData);
  const time = stringToDateTime(timeString, "h:mm", "America/Chicago", !isFajr);

  return {
    iqamah: time,
    confidence: 100
  };
}

function getMaghrib(): DateTime {
  const times = getAdhanTimes(
    {
      type: "Point",
      coordinates: [29.9573962, -95.4508135]
    },
    "shafi",
    DateTime.local().setZone("America/Chicago")
  );
  return jsDateToDateTime(times.maghrib, "America/Chicago").plus({
    minutes: 5
  });
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  abortMediaRequests(page);

  await page.goto("http://www.masjidbilalnz.org/", {
    waitUntil: "domcontentloaded"
  });

  const fajr = await getTime(page, 1, true);
  const zuhr = await getTime(page, 2, false);
  const asr = await getTime(page, 4, false);
  const isha = await getTime(page, 6, false);

  const maghrib: Prayer = {
    iqamah: getMaghrib(),
    confidence: 100
  };
  const jummah: Prayer = {
    iqamah: stringToDateTime("13:30", "HH:mm", "America/Chicago"),
    confidence: 100
  };

  return [
    {
      fajr,
      zuhr,
      asr,
      maghrib,
      isha,
      jummah
    }
  ];
}
