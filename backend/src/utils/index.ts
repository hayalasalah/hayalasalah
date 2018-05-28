import { DateTime } from "luxon";
import { DaySchedule, PrayerName } from "../types/PrayerTime";

// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export const FRIDAY = 5;

export const snooze = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export function toDateTime(time: DateTime | string) {
  if (typeof time === "string") {
    return DateTime.fromISO(time, { setZone: true });
  } else {
    return time;
  }
}

export function nextPrayer(
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
    return toDateTime(prayerTime.iqamah);
  } else {
    return toDateTime(prayer.iqamah);
  }
}
