// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// tslint:disable:no-console

import { ReadLine } from "readline";

import chalk from "chalk";
import { StoreMode } from "documentdb-typescript";
import { DateTime, Duration } from "luxon";
import { Argv } from "yargs";

// tslint:disable-next-line:no-implicit-dependencies
import { Point } from "geojson";
// tslint:disable-next-line:no-var-requires
const { default: readline } = require("readline-promise");

import { getMonthlyTimetableId, openCollection, toID } from "../../database";
import { MonthlyTimetable, Mosque } from "../../types/Mosque";
import { DaySchedule, PrayerTimeTable } from "../../types/PrayerTime";
import {
  AdhanTimes,
  adhanTimesToDaySchedule,
  getAdhanTimes,
  Madhab,
  stringToPoint
} from "../../utils/adhanUtil";
import { jsDateToDateTime } from "../../utils/time";

type ReadLinePromise = ReadLine & {
  questionAsync: (q: string) => Promise<string>;
};

export const command = "add-mosque <mosque>";
export const describe = "Adds a new mosque to the database";
export const builder = {};

export interface AddMosqueArguments extends Argv {
  mosque: string;
}

function buildInitialPrayerTimes(
  location: Point,
  madhab: Madhab,
  timezone: string
): PrayerTimeTable[] {
  const result: PrayerTimeTable[] = [];

  for (let month = 1; month <= 12; month++) {
    let date = DateTime.local().set({ month });
    const monthTable: PrayerTimeTable = [];
    for (let day = 1; day <= date.daysInMonth; day++) {
      date = date.set({ day });
      const adhanTimes = getAdhanTimes(location, madhab, date);

      const tz = `America/${timezone}`;
      monthTable.push(adhanTimesToDaySchedule(adhanTimes, tz));
    }
    result.push(monthTable);
  }

  return result;
}

async function handlerAsync(args: AddMosqueArguments) {
  const rlp: ReadLinePromise = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  const name = await rlp.questionAsync("Mosque name: ");
  const location = await rlp.questionAsync("City, State: ");
  const coordinates = stringToPoint(
    await rlp.questionAsync("Latitude,Longitude: ")
  );
  const madhabIn = await rlp.questionAsync("Madhab: ");
  const timezone = await rlp.questionAsync("Timezone: ");

  const madhab: Madhab = madhabIn.toLowerCase().startsWith("h")
    ? "hanafi"
    : "shafi";
  const timetable = buildInitialPrayerTimes(coordinates, madhab, timezone);

  const collection = await openCollection();

  for (let index = 0; index < timetable.length; index++) {
    const monthTable: MonthlyTimetable = {
      kind: "timetable",
      id: getMonthlyTimetableId(args.mosque, index + 1),
      timetable: timetable[index]
    };

    const added: MonthlyTimetable = await collection.storeDocumentAsync(
      monthTable,
      StoreMode.CreateOnly
    );
    if (added.id === undefined) {
      throw Error("Unable to update month table");
    }
  }

  const mosque: Mosque = {
    kind: "mosque",
    id: toID(args.mosque),
    tag: args.mosque,
    name,
    location,
    gps: coordinates
  };

  const inserted = await collection.storeDocumentAsync(
    mosque,
    StoreMode.CreateOnly
  );

  console.log(chalk.bold.greenBright(`Successfully added ${args.mosque}`));

  rlp.close();
}

export function handler(args: AddMosqueArguments) {
  handlerAsync(args).catch(console.error);
}
