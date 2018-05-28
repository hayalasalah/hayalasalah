// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";

export type PrayerName =
  | "fajr"
  | "zuhr"
  | "asr"
  | "maghrib"
  | "isha"
  | "jummah";

/** Represents the adhan and iqamah time for a single prayer jamat */
export interface Prayer {
  adhan?: DateTime;
  iqamah: DateTime;
  confidence: number;
}

/** PrayerTimes represents the times for a single day. Can have either 1 jamat or multiple */
export type DaySchedule = { [Name in PrayerName]?: Prayer | Prayer[] };

/** Prayer times over multiple days */
export type PrayerTimeTable = DaySchedule[];
