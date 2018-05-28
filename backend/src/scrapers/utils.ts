// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime, Duration, Zone } from "luxon";
import { ElementHandle, Page } from "puppeteer";
import { DaySchedule, Prayer, PrayerName } from "../types/PrayerTime";

export async function abortMediaRequets(page: Page) {
  await page.setRequestInterception(true);

  page.on("request", async req => {
    const mediaTypes = ["images", "stylesheet", "font", "scripts"];
    const isMedia = mediaTypes.indexOf(req.resourceType()) !== -1;
    (await isMedia) ? req.abort() : req.continue();
  });
}

export async function getTableData(handle: ElementHandle): Promise<string> {
  const prop = await handle.getProperty("innerText");
  const text: string = await prop.jsonValue();
  return text.trim();
}

export function arrayOfPrayersToDaySchedule(times: Prayer[]): DaySchedule {
  return {
    fajr: times[0],
    zuhr: times[1],
    asr: times[2],
    maghrib: times[3],
    isha: times[4]
  };
}

export function stringToDateTime(
  time: string,
  format: string,
  timeZone: string | Zone,
  addHalfDay: boolean = false
): DateTime {
  const hoursOffset = addHalfDay ? 12 : 0; // Add 12 hours if it's not Fajr
  const dt = DateTime.fromString(time, format, {
    zone: timeZone
  });
  if (dt.isValid === false) {
    throw Error(`Invalid DT: ${dt.invalidReason}`);
  }
  return dt.plus(Duration.fromObject({ hours: hoursOffset }));
}

export async function getDataForXPath(
  page: Page,
  xpath: string
): Promise<string> {
  const [handle] = await page.$x(xpath);
  if (handle === undefined || handle === null) {
    throw new Error(`Did not find element for xpath ${xpath}`);
  }

  return getTableData(handle);
}

function nextPrayer(
  current: PrayerName,
  isJummah: boolean = false
): PrayerName {
  switch (current) {
    case "fajr":
      return isJummah ? "zuhr" : "jummah";
    case "zuhr":
      return "asr";
    case "asr":
      return "maghrib";
    case "maghrib":
      return "isha";
    case "isha":
      return "fajr";
    case "jummah":
      return "asr";
  }
}

export function guessDay(
  schedule: DaySchedule,
  basedOn: PrayerName = "fajr"
): DateTime {
  const prayer = schedule[basedOn];

  if (basedOn === "isha" && prayer === undefined) {
    throw Error("Unable to determine day");
  }

  if (prayer === undefined) {
    return guessDay(schedule, nextPrayer(basedOn));
  } else if (Array.isArray(prayer)) {
    const [prayerTime] = prayer;
    return prayerTime.iqamah;
  } else {
    return prayer.iqamah;
  }
}

export const FRIDAY = 5;
