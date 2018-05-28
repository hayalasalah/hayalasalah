// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Browser } from "puppeteer";
import { DaySchedule, Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import {
  abortMediaRequets,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  stringToDateTime
} from "../utils";

// Common code for the Adams Center group of masjids

function getXPathString(prayerIndex: number, adhan: boolean) {
  return `//*[@id="wp-calendar"]/tbody/tr[${prayerIndex}]/td[${adhan ? 2 : 3}]`;
}

export async function scrapeAdams(browser: Browser): Promise<DaySchedule> {
  const page = await browser.newPage();
  await abortMediaRequets(page);

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("https://www.adamscenter.org/salat_times.php", {
    waitUntil: "networkidle2"
  });

  const tableIndices = [1, 3, 4, 5, 6];
  const times: Prayer[] = [];

  for (const tableIndex of tableIndices) {
    const adhanXPath = getXPathString(tableIndex, true);
    const adhanString = await getDataForXPath(page, adhanXPath);
    const adhan = stringToDateTime(adhanString, "h:mm a", "America/New_York");

    const iqamahXPath = getXPathString(tableIndex, false);
    const iqamahString = await getDataForXPath(page, iqamahXPath);
    const iqamah = stringToDateTime(iqamahString, "h:mm a", "America/New_York");

    times.push({
      adhan,
      iqamah,
      confidence: 100
    });
  }

  await page.close();

  const daySchedule = arrayOfPrayersToDaySchedule(times);
  return daySchedule;
}
