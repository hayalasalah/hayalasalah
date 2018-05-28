// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime, Duration } from "luxon";
import { DaySchedule } from "../types/PrayerTime";
import { jsDateToDateTime } from "./time";

// tslint:disable-next-line:no-implicit-dependencies
import { Point } from "geojson";
// tslint:disable-next-line:no-var-requires
const adhan = require("adhan");

export type Madhab = "shafi" | "hanafi";

export interface AdhanTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export function stringToPoint(latLong: string): Point {
  const [lat, long] = latLong.split(",");
  return {
    type: "Point",
    coordinates: [parseFloat(lat), parseFloat(long)]
  };
}

function pointToCoordinates(location: Point): any {
  return new adhan.Coordinates(
    location.coordinates[0],
    location.coordinates[1]
  );
}

function madhabToParams(madhab: Madhab): any {
  const params = adhan.CalculationMethod.NorthAmerica();
  params.madhab =
    madhab === "hanafi" ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  return params;
}

export function getAdhanTimes(
  location: Point,
  madhab: Madhab,
  date: DateTime
): AdhanTimes {
  const coordinates = pointToCoordinates(location);
  const params = madhabToParams(madhab);
  return new adhan.PrayerTimes(coordinates, date.toJSDate(), params);
}

export function adhanTimesToDaySchedule(
  adhanTimes: AdhanTimes,
  tz: string
): DaySchedule {
  const fajr = jsDateToDateTime(adhanTimes.fajr, tz);
  const zuhr = jsDateToDateTime(adhanTimes.dhuhr, tz);
  const asr = jsDateToDateTime(adhanTimes.asr, tz);
  const maghrib = jsDateToDateTime(adhanTimes.maghrib, tz);
  const isha = jsDateToDateTime(adhanTimes.isha, tz);

  const delay = Duration.fromObject({ minutes: 5 });
  return {
    fajr: {
      confidence: 0,
      adhan: fajr,
      iqamah: fajr.plus(delay)
    },
    zuhr: {
      confidence: 0,
      adhan: zuhr,
      iqamah: zuhr.plus(delay)
    },
    asr: {
      confidence: 0,
      adhan: asr,
      iqamah: asr.plus(delay)
    },
    maghrib: {
      confidence: 0,
      adhan: maghrib,
      iqamah: maghrib.plus(delay)
    },
    isha: {
      confidence: 0,
      adhan: isha,
      iqamah: isha.plus(delay)
    }
  };
}
