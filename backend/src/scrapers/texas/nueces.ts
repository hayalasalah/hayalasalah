// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime, Duration } from "luxon";
import { Browser } from "puppeteer";
import {
  DaySchedule,
  Prayer,
  PrayerName,
  PrayerTimeTable
} from "../../types/PrayerTime";
import {
  abortMediaRequests,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  getTableData,
  stringToDateTime
} from "../utils";

function getXPathString(tableIndex: number) {
  return `//*[@id="post-42"]/div/div[1]/div/div[1]/div[1]/table/tbody/tr[${tableIndex}]/td[2]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  await abortMediaRequests(page);

  await page.goto("http://nuecesmosque.com", { waitUntil: "domcontentloaded" });

  const tableIndices = [4, 6, 7, 8, 9];
  const times = await Promise.all(
    tableIndices.map(async (tableIndex, index): Promise<Prayer> => {
      const isFajr = index === 0;
      const xpath = getXPathString(tableIndex);
      let timeString = await getDataForXPath(page, xpath);
      if (timeString.startsWith("**")) {
        timeString = timeString.slice(2);
      }
      return {
        confidence: 100,
        iqamah: stringToDateTime(timeString, "h:mm", "America/Chicago", !isFajr)
      };
    })
  );

  await page.close();

  const daySchedule = arrayOfPrayersToDaySchedule(times);
  daySchedule.jummah = [
    {
      confidence: 100,
      iqamah: stringToDateTime("13:05", "HH:mm", "America/Chicago")
    },
    {
      confidence: 100,
      iqamah: stringToDateTime("14:05", "HH:mm", "America/Chicago")
    }
  ];

  return [daySchedule];
}
