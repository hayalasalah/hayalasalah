// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Browser } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import { FRIDAY, guessDay } from "../../utils";
import {
  abortMediaRequests,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  stringToDateTime
} from "../utils";

function getXPathString(day: number, index: number) {
  return `//*[@id="ctl00_ctl00_ctl00_cphContent_cphContent_cphContent_gvTimes"]/tbody/tr[${day}]/td[${index}]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  abortMediaRequests(page);

  await page.goto("http://www.bilalmasjid.com/Prayer/Daily.aspx", {
    waitUntil: "domcontentloaded"
  });

  const daysInCurrentMonth = DateTime.local().setZone("America/Los_Angeles")
    .daysInMonth;

  const monthTable: PrayerTimeTable = [];
  for (let day = 2; day < daysInCurrentMonth + 2; day++) {
    const tableIndices = [3, 6, 8, 10, 12];

    const timesForDay = await Promise.all(
      tableIndices.map(
        async (tableIndex, index): Promise<Prayer> => {
          const isFajr = index === 0;

          const adhanXPath = getXPathString(day, tableIndex);
          const adhanTimeString = await getDataForXPath(page, adhanXPath);
          const adhanTime = stringToDateTime(
            adhanTimeString,
            "h:mm",
            "America/Los_Angeles",
            !isFajr
          ).set({ day: day - 1 });

          const iqamahXPath = getXPathString(day, tableIndex + 1);
          const iqamahTimeString = await getDataForXPath(page, iqamahXPath);
          const iqamahTime = stringToDateTime(
            iqamahTimeString,
            "h:mm",
            "America/Los_Angeles",
            !isFajr
          ).set({ day: day - 1 });

          return {
            adhan: adhanTime,
            iqamah: iqamahTime,
            confidence: 100
          };
        }
      )
    );
    const schedule = arrayOfPrayersToDaySchedule(timesForDay);

    if (guessDay(schedule).weekday === FRIDAY) {
      schedule.jummah = schedule.zuhr; // Jummah is at the same time as zuhr
      schedule.zuhr = undefined; // unset zuhr since it's not offered
    }
    monthTable.push(schedule);
  }

  await page.close();

  return monthTable;
}
