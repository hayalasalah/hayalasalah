// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import { Argv } from "yargs";
import {
  getMonthlyTimetableId,
  getTimesForToday,
  openCollection
} from "../../database";
import { printDay } from "../../utils/print";

// tslint:disable:no-console

export const command = "lookup <mosque>";
export const describe = "Lookup the times for a mosque";
export const builder = {};

export interface LookupArguments extends Argv {
  mosque: string;
}

async function handlerAsync(args: LookupArguments) {
  const collection = await openCollection();
  const daySchedule = await getTimesForToday(collection, args.mosque);
  printDay(daySchedule);
}

export function handler(args: LookupArguments) {
  handlerAsync(args).catch(console.error);
}
