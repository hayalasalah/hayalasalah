// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { PrayerTimeTable } from "./PrayerTime";

// tslint:disable-next-line:no-implicit-dependencies
import { Point } from "geojson";

export interface Mosque {
  kind: "mosque";
  id: string;
  tag: string;
  name: string;
  location: string;
  gps: Point;
}

// These have a name of timetable-{mosque-id}-{month abbrev} (id not tag)
export interface MonthlyTimetable {
  kind: "timetable";
  id?: string;
  timetable: PrayerTimeTable;
}
