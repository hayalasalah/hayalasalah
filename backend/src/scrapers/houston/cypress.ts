// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Browser } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import { snooze } from "../../utils";
import { getAdhanTimes } from "../../utils/adhanUtil";
import { scrapeTableRow } from "../../utils/TableScraper";
import { jsDateToDateTime } from "../../utils/time";
import {
  abortMediaRequests,
  arrayOfPrayersToDaySchedule,
  stringToDateTime
} from "../utils";

const getXPath = (i: number) =>
  `//*[@id="mosqueprayertimingswidgetplugin-2"]/table/tbody/tr[${i}]/td[2]`;

function getMaghrib(): DateTime {
  const times = getAdhanTimes(
    {
      type: "Point",
      coordinates: [30.000813, -95.7009327]
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
  await abortMediaRequests(page);

  await page.goto("http://cypressislamiccenter.org/", {
    waitUntil: "domcontentloaded",
    timeout: 20000
  });

  const times: Prayer[] = [];
  const tableRows = [2, 3, 4, 5, 6];
  for (const row of tableRows) {
    if (row === 5) {
      times.push({
        iqamah: getMaghrib(),
        confidence: 100
      });
      continue;
    }
    const iqamahXPath = getXPath(row);
    const prayer = await scrapeTableRow(page, {
      iqamahXPath,
      timeFormat: "h:mm a",
      timeZone: "America/Chicago"
    });
    times.push(prayer);
  }

  const daySchedule = arrayOfPrayersToDaySchedule(times);

  daySchedule.jummah = [
    {
      iqamah: stringToDateTime("13:30", "h:mm", "America/Chicago"),
      confidence: 100
    }
  ];

  return [daySchedule];
}
