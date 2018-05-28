// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Collection, Database } from "documentdb-typescript";
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
