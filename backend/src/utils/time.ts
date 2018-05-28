// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { DaySchedule, Prayer, PrayerName } from "../types/PrayerTime";

export function jsDateToDateTime(date: any, timezone: string): DateTime {
  const dt = DateTime.fromJSDate(date).setZone(timezone);
  if (dt.isValid === false) {
    throw Error(`Bad date ${date}: ${dt.invalidReason}`);
  }
  return dt;
}

export function updateTime(
  current: Prayer | Prayer[] | undefined,
  incoming: Prayer | Prayer[] | undefined
) {
  if (current === undefined || incoming === undefined) {
    return;
  } else if (Array.isArray(incoming)) {
    if (Array.isArray(current)) {
      if (incoming.length !== current.length) {
        throw Error("Incomparable lengths - manual merging required");
      }

      for (let i = 0; i < incoming.length; i++) {
        updateTime(current[i], incoming[i]);
      }
    } else {
      for (const prayer of incoming) {
        updateTime(current, prayer);
      }
    }
  } else if (!Array.isArray(current)) {
    if (incoming.adhan === undefined) {
      incoming.adhan = current.adhan;
    }
  } else {
    throw Error(
      "Current is an array, and incoming is not. Manual merging required"
    );
  }
}

export function updateSchedule(current: DaySchedule, incoming: DaySchedule) {
  updateTime(current.fajr, incoming.fajr);
  updateTime(current.zuhr, incoming.zuhr);
  updateTime(current.asr, incoming.asr);
  updateTime(current.maghrib, incoming.maghrib);
  updateTime(current.isha, incoming.isha);
  updateTime(current.jummah, incoming.jummah);
}
