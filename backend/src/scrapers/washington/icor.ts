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
  abortMediaRequets,
  arrayOfPrayersToDaySchedule,
  getDataForXPath,
  getTableData,
  guessDay,
  stringToDateTime
} from "../utils";

function getAdhanXPath(prayerName: string) {
  return `//*[@id="${prayerName}ValueAdhan${
    prayerName === "asr" ? "Hanafi" : ""
  }"]/span`;
}

function getIqamahXPath(prayerName: string) {
  return `//*[@id="${prayerName}Value${
    prayerName === "asr" ? "Hanafi" : ""
  }"]/span`;
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const page = await browser.newPage();
  await abortMediaRequets(page);

  await page.goto("http://www.redmondmosque.org");

  const results = [];

  const prayerNames = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  for (const [index, prayerName] of prayerNames.entries()) {
    const isFajr = index === 0;

    const adhanXPath = getAdhanXPath(prayerName);
    const adhanString = await getDataForXPath(page, adhanXPath);
    const adhanTime = stringToDateTime(
      adhanString,
      "h:mm",
      "America/Los_Angeles",
      !isFajr
    );

    const iqamahXPath = getIqamahXPath(prayerName);
    const iqamahString = await getDataForXPath(page, iqamahXPath);
    const iqamahTime = stringToDateTime(
      iqamahString,
      "h:mm",
      "America/Los_Angeles",
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

  daySchedule.jummah = [
    {
      confidence: 100,
      iqamah: stringToDateTime("13:30", "HH:mm", "America/Los_Angeles")
    },
    {
      confidence: 100,
      iqamah: stringToDateTime("15:30", "HH:mm", "America/Los_Angeles")
    }
  ];

  return [daySchedule];
}
