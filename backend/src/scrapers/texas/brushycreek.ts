// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Browser } from "puppeteer";
import { Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import {
  abortMediaRequests,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  stringToDateTime
} from "../utils";

function getIqamahXPath(index: number): string {
  return `/html/body/header/div[2]/div/div/div/section/ul/li[${index}]/ul/li[2]/p`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  await abortMediaRequests(page);

  await page.goto("http://icbrushycreek.org/ramadan/");

  const tableIndices = [1, 3, 4, 5, 6];
  const times = await Promise.all(
    tableIndices.map(async (tableIndex, index): Promise<Prayer> => {
      const isFajr = index === 0;
      const xpath = getIqamahXPath(tableIndex);
      const timeString = await getDataForXPath(page, xpath);
      return {
        confidence: 100,
        iqamah: stringToDateTime(timeString, "h:mm", "America/Chicago", !isFajr)
      };
    })
  );

  await page.close();
  return [arrayOfPrayersToDaySchedule(times)];
}
