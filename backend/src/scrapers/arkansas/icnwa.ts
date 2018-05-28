// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Browser, Page } from "puppeteer";
import { PrayerTimeTable } from "../../types/PrayerTime";
import { guessDay } from "../../utils";
import {
  abortMediaRequets,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  stringToDateTime
} from "../utils";

function getXPathString(column: number, row: number) {
  return `//*[@id="jBox1"]/div/div[2]/table/tbody/tr[${row}]/td[${column}]`;
}

async function clickButtonAndWaitForModal(page: Page) {
  const buttonXPath = `//*[@id="post-53"]/div/div[1]/div/div/div/div/div/div/div[2]/a`;
  const [button] = await page.$x(buttonXPath);
  await button.click();
}

const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();

  await page.goto("http://icnwa.com");

  await snooze(1000); // need to snooze so page loads....
  await await clickButtonAndWaitForModal(page);

  const results = [];
  for (let row = 2; row <= 6; row++) {
    const isFajr = row === 2;
    const adhanXPath = getXPathString(2, row);
    const adhanString = await getDataForXPath(page, adhanXPath);
    const adhanTime = stringToDateTime(
      adhanString,
      "h:mm a",
      "America/Chicago",
      !isFajr
    );

    const iqamahXPath = getXPathString(3, row);
    const iqamahString = await getDataForXPath(page, iqamahXPath);
    const iqamahTime = stringToDateTime(
      iqamahString,
      "h:mm a",
      "America/Chicago",
      !isFajr
    );

    results.push({
      confidence: 100,
      adhan: adhanTime,
      iqamah: iqamahTime
    });
  }

  await page.close();

  const daySchedule = arrayOfPrayersToDaySchedule(results);
  const day = guessDay(daySchedule);
  if (day.month === 11) {
    throw Error("Check back in November for jummah!");
  }

  daySchedule.jummah = {
    confidence: 100,
    iqamah: stringToDateTime("13:30", "HH:mm", "America/Los_Angeles")
  };

  return [daySchedule];
}
