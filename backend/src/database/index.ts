// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Collection, Database, StoreMode } from "documentdb-typescript";
import { MonthlyTimetable } from "../types/Mosque";
import { PrayerTimeTable } from "../types/PrayerTime";
import { guessDay } from "../utils";
import { updateSchedule } from "../utils/time";
import { config } from "./config";

export async function openCollection(): Promise<Collection> {
  const collection = new Collection(
    config.collectionName,
    config.dbName,
    config.url,
    config.privateKey
  );
  await collection.openAsync();
  return collection;
}

export function toID(tag: string) {
  return tag.replace("/", "-");
}

const months = [
  "invalid",
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec"
];
export function getMonthlyTimetableId(tag: string, month: number) {
  if (month < 1 || month > 12) {
    throw Error(`Invalid month: ${month}`);
  }
  return `timetable-${toID(tag)}-${months[month]}`;
}

export async function updateDB(
  collection: Collection,
  mosque: string,
  month: number,
  timetable: PrayerTimeTable
) {
  const timetableId = getMonthlyTimetableId(mosque, month);
  const doc = await collection.findDocumentAsync<MonthlyTimetable>(timetableId);

  for (const day of timetable) {
    const dayOfMonth = guessDay(day).day - 1;

    updateSchedule(doc.timetable[dayOfMonth], day);
    doc.timetable[dayOfMonth] = day;
  }

  await collection.storeDocumentAsync(doc, StoreMode.UpdateOnly);
}
