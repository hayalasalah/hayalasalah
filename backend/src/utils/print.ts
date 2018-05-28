// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import chalk from "chalk";
import { FRIDAY, guessDay, toDateTime } from ".";
import {
  DaySchedule,
  Prayer,
  PrayerName,
  PrayerTimeTable
} from "../types/PrayerTime";

// tslint:disable:no-console

const prayerName = chalk.bold.green;

export function printSingleJamat(name: PrayerName, prayer: Prayer) {
  const adhan = prayer.adhan ? toDateTime(prayer.adhan).toFormat("HH:mm") : "-";
  const iqamah = toDateTime(prayer.iqamah).toFormat("HH:mm");
  console.log(`\t${prayerName(name)}\t${adhan}\t${iqamah}`);
}

export function printMultipleJamat(name: PrayerName, jamats: Prayer[]) {
  console.log(`\t${prayerName(name)}`);
  for (const jamat of jamats) {
    const adhan = jamat.adhan ? toDateTime(jamat.adhan).toFormat("HH:mm") : "-";
    const iqamah = toDateTime(jamat.iqamah).toFormat("HH:mm");
    console.log(`\t\t${adhan}\t${iqamah}`);
  }
}

export function printPrayer(
  name: PrayerName,
  prayer: Prayer | Prayer[] | undefined
) {
  if (prayer === undefined) {
    console.log(`\t${prayerName(name)}`);
  } else if (Array.isArray(prayer)) {
    printMultipleJamat(name, prayer);
  } else {
    printSingleJamat(name, prayer);
  }
}

export function printDay(schedule: DaySchedule) {
  const day = guessDay(schedule);
  console.log(chalk.whiteBright.bold(day.toFormat("MMMM dd")));

  printPrayer("fajr", schedule.fajr);
  printPrayer("zuhr", schedule.zuhr);
  printPrayer("asr", schedule.asr);
  printPrayer("maghrib", schedule.maghrib);
  if (day.weekday === FRIDAY) {
    printPrayer("jummah", schedule.jummah);
  }
  printPrayer("isha", schedule.isha);
}

export function printTimeTable(table: PrayerTimeTable) {
  for (const day of table) {
    printDay(day);
  }
}
