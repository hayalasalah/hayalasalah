// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Collection, Database, StoreMode } from "documentdb-typescript";
import { DateTime } from "luxon";
import { MonthlyTimetable } from "../types/Mosque";
import {
  DaySchedule,
  MonthName,
  PrayerTimeTable,
  YearTable
} from "../types/PrayerTime";
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

export async function getTimesForYear(
  collection: Collection,
  tag: string
): Promise<YearTable> {
  const ids = months
    .slice(1)
    .map(monthName => `"timetable-${toID(tag)}-${monthName}"`);
  const query = `SELECT c.id, c.timetable FROM c WHERE c.id IN (${ids.join(
    ","
  )})`;

  interface ResultDoc {
    id: string;
    timetable: PrayerTimeTable;
  }

  const result: YearTable = {
    jan: [],
    feb: [],
    mar: [],
    apr: [],
    may: [],
    jun: [],
    jul: [],
    aug: [],
    sep: [],
    oct: [],
    nov: [],
    dec: []
  };

  const docStream = collection.queryDocuments<ResultDoc>(query);
  for await (const doc of docStream) {
    const month = doc.id.substr(doc.id.length - 3) as MonthName;
    result[month] = doc.timetable;
  }

  return result;
}

export async function getTimesForMonth(
  collection: Collection,
  tag: string
): Promise<PrayerTimeTable> {
  const today = DateTime.local();
  const timetableId = getMonthlyTimetableId(tag, today.month);
  const doc = await collection.findDocumentAsync<MonthlyTimetable>(timetableId);
  return doc.timetable;
}

export async function getTimesForToday(
  collection: Collection,
  tag: string
): Promise<DaySchedule> {
  const timetable = await getTimesForMonth(collection, tag);
  const today = DateTime.local();
  const daySchedule = timetable[today.day - 1];
  return daySchedule;
}
