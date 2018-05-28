// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Browser } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import {
  abortMediaRequests,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  getTableData,
  stringToDateTime
} from "../utils";

function getXPathString(day: number, index: number) {
  return `//*[@id="monthlyTimetable"]/table/tbody/tr[${day}]/td[${index}]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  abortMediaRequests(page);

  await page.goto(
    "https://www.mapsredmond.org/2015/11/12/maps-2015-prayer-calendar/"
  );

  await page.waitForXPath(getXPathString(3, 3));

  const daysInCurrentMonth = DateTime.local().setZone("America/Los_Angeles")
    .daysInMonth;

  const monthTable: PrayerTimeTable = [];
  for (let day = 3; day < daysInCurrentMonth + 3; day++) {
    const tableIndices = [3, 6, 9, 11, 13];

    const timesForDay = await Promise.all(
      tableIndices.map(async (tableIndex, index): Promise<Prayer> => {
        const isFajr = index === 0;

        const adhanXPath = getXPathString(day, tableIndex);
        const adhanTimeString = await getDataForXPath(page, adhanXPath);

        const iqamahXPath = getXPathString(day, tableIndex + 1);
        const iqamahTimeString = await getDataForXPath(page, iqamahXPath);

        return {
          adhan: stringToDateTime(
            adhanTimeString,
            "h:mm a",
            "America/Los_Angeles"
          ).set({ day: day - 2 }),
          iqamah: stringToDateTime(
            iqamahTimeString,
            "h:mm a",
            "America/Los_Angeles"
          ).set({ day: day - 2 }),
          confidence: 100
        };
      })
    );
    monthTable.push(arrayOfPrayersToDaySchedule(timesForDay));
  }

  await page.close();

  return monthTable;
}
