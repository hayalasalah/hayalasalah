// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Browser } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import {
  abortMediaRequets,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  getTableData,
  stringToDateTime
} from "../utils";

function getXPathString(day: number, index: number, adhan: boolean) {
  return `//*[@id="post-2906"]/div/table/tbody/tr[${day}]/td[${index}]/span[${
    adhan ? 1 : 2
  }]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  abortMediaRequets(page);

  await page.goto("http://www.namcc.org/prayer-time-table/");

  const daysInCurrentMonth = DateTime.local().setZone("America/Chicago")
    .daysInMonth;

  const monthTable: PrayerTimeTable = [];
  for (let day = 1; day < daysInCurrentMonth + 1; day++) {
    const tableIndices = [2, 4, 5, 6, 7];

    const timesForDay = await Promise.all(
      tableIndices.map(async (tableIndex, index): Promise<Prayer> => {
        const isFajr = index === 0;

        const adhanXPath = getXPathString(day, tableIndex, true);
        const adhanTimeString = await getDataForXPath(page, adhanXPath);

        const iqamahXPath = getXPathString(day, tableIndex, false);
        const iqamahTimeString = await getDataForXPath(page, iqamahXPath);

        const adhanTime = stringToDateTime(
          adhanTimeString,
          "h:mm",
          "America/Chicago",
          !isFajr
        ).set({ day });

        const iqamahTime = stringToDateTime(
          iqamahTimeString,
          "h:mm",
          "America/Chicago",
          !isFajr
        ).set({ day });

        return {
          adhan: adhanTime,
          iqamah: iqamahTime,
          confidence: 100
        };
      })
    );
    monthTable.push(arrayOfPrayersToDaySchedule(timesForDay));
  }

  await page.close();

  return monthTable;
}
