// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Browser } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import { toDateTime } from "../../utils";
import { abortMediaRequests, arrayOfPrayersToDaySchedule } from "../utils";
import { scrapeTableRow } from "../utils/TableScraper";

function getXPathString(day: number, index: number) {
  return `//*[@id="prayeSchedulePrint"]/tbody/tr[${day}]/td[${index}]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  await abortMediaRequests(page);

  await page.goto("http://planomasjid.org/monthly-prayer-schedule/", {
    waitUntil: "domcontentloaded"
  });

  const daysInCurrentMonth = DateTime.local().setZone("America/Chicago")
    .daysInMonth;

  const monthTable: PrayerTimeTable = [];
  for (let day = 1; day < daysInCurrentMonth + 1; day++) {
    const tableIndices = [3, 7, 9, 11, 13];
    const dayTimes: Prayer[] = [];
    for (const tableIndex of tableIndices) {
      const adhanXPath = getXPathString(day, tableIndex);
      const iqamahXPath = getXPathString(day, tableIndex + 1);
      const prayer = await scrapeTableRow(page, {
        adhanXPath,
        iqamahXPath,
        timeFormat: "h:mm a",
        timeZone: "America/Chicago"
      });
      if (prayer.adhan) {
        prayer.adhan = toDateTime(prayer.adhan).set({ day });
      }
      prayer.iqamah = toDateTime(prayer.iqamah).set({ day });

      dayTimes.push(prayer);
    }
    const schedule = arrayOfPrayersToDaySchedule(dayTimes);
    monthTable.push(schedule);
  }

  await page.close();
  return monthTable;
}
