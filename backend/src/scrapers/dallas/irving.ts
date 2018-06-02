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
  stringToDateTime
} from "../utils";

function getXPathString(prayerIndex: number, adhan: boolean) {
  return `//*[@id="post-46"]/div/div[3]/div/div[1]/div[2]/div/table/tbody/tr[${prayerIndex}]/td[${
    adhan ? 1 : 2
  }]`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  await abortMediaRequests(page);

  await page.goto("https://irvingmasjid.org/");

  const times: Prayer[] = [];

  const tableIndices = [3, 5, 6, 7, 8];
  for (const tableIndex of tableIndices) {
    const adhanXPath = getXPathString(tableIndex, true);
    const iqamahXPath = getXPathString(tableIndex, false);

    const prayer = await scrapeTableRow(page, {
      adhanXPath,
      iqamahXPath,
      timeFormat: "h:mm a",
      timeZone: "America/Chicago"
    });

    times.push(prayer);
  }

  const daySchedule = arrayOfPrayersToDaySchedule(times);
  daySchedule.jummah = [
    {
      confidence: 100,
      iqamah: stringToDateTime("13:45", "HH:mm", "America/Chicago")
    },
    {
      confidence: 100,
      iqamah: stringToDateTime("14:45", "HH:mm", "America/Chicago")
    }
  ];

  return [daySchedule];
}
