// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Browser } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import { scrapeTableRow } from "../../utils/TableScraper";
import {
  abortMediaRequests,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  stringToDateTime
} from "../utils";

function getXPathString(prayerIndex: number, adhan: boolean) {
  return `//*[@id="mma-salahTimesContainer"]/table/tbody/tr[${prayerIndex}]/td[${
    adhan ? 2 : 3
  }]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  await abortMediaRequests(page);

  await page.goto("https://www.alsalammasjid.org", {
    waitUntil: "networkidle2"
  });

  const [, frame] = page.frames();

  const tableIndices = [1, 3, 4, 5, 6];
  const times: Prayer[] = [];

  for (const tableIndex of tableIndices) {
    const adhanXPath = getXPathString(tableIndex, true);
    const iqamahXPath = getXPathString(tableIndex, false);

    const prayer = await scrapeTableRow(frame, {
      adhanXPath,
      iqamahXPath,
      timeFormat: "h:mm a",
      timeZone: "America/Chicago"
    });

    times.push(prayer);
  }

  const daySchedule = arrayOfPrayersToDaySchedule(times);

  const firstJummahString = await getDataForXPath(
    frame,
    getXPathString(7, true)
  );

  const secondJummahString = await getDataForXPath(
    frame,
    getXPathString(9, true)
  );

  daySchedule.jummah = [
    {
      iqamah: stringToDateTime(firstJummahString, "h:mm a", "America/Chicago"),
      confidence: 100
    },
    {
      iqamah: stringToDateTime(secondJummahString, "h:mm a", "America/Chicago"),
      confidence: 100
    }
  ];

  return [daySchedule];
}
