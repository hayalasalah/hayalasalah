// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Browser } from "puppeteer";
import { guessDay } from "../../../dist/utils";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import {
  abortMediaRequests,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  stringToDateTime
} from "../utils";

function getXPathString(day: number, index: number) {
  return `//*[@id="calendar"]/div[4]/table/tbody/tr[${day}]/td[${index}]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  abortMediaRequests(page);

  await page.goto("https://www.assaber.com/prayer-timetable.htm", {
    waitUntil: "domcontentloaded"
  });

  const daysInCurrentMonth = DateTime.local().setZone("America/Los_Angeles")
    .daysInMonth;

  const monthTable: PrayerTimeTable = [];
  for (let day = 3; day < daysInCurrentMonth + 3; day++) {
    const tableIndices = [3, 6, 8, 10, 12];

    const timesForDay = await Promise.all(
      tableIndices.map(
        async (tableIndex, index): Promise<Prayer> => {
          const adhanXPath = getXPathString(day, tableIndex);
          const adhanTimeString = await getDataForXPath(page, adhanXPath);

          const iqamahXPath = getXPathString(day, tableIndex + 1);
          const iqamahTimeString = await getDataForXPath(page, iqamahXPath);

          return {
            adhan: stringToDateTime(
              adhanTimeString,
              "hh:mm a",
              "America/Los_Angeles",
              false
            ).set({ day: day - 2 }),
            iqamah: stringToDateTime(
              iqamahTimeString,
              "hh:mm a",
              "America/Los_Angeles",
              false
            ).set({ day: day - 2 }),
            confidence: 100
          };
        }
      )
    );
    const schedule = arrayOfPrayersToDaySchedule(timesForDay);
    if (guessDay(schedule).weekday === 5) {
      schedule.jummah = schedule.zuhr;
      schedule.zuhr = undefined;
    }
    monthTable.push(schedule);
  }

  await page.close();

  return monthTable;
}
