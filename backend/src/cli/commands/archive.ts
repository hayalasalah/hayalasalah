// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// tslint:disable:no-console

import chalk from "chalk";
import { Collection, StoreMode } from "documentdb-typescript";
import { groupBy } from "lodash";
import { Browser } from "puppeteer";
import { Argv } from "yargs";
import { getMonthlyTimetableId, openCollection } from "../../database";
import { scrape, scrapersList } from "../../scrapers";
import { MonthlyTimetable } from "../../types/Mosque";
import { DaySchedule, PrayerTimeTable } from "../../types/PrayerTime";
import { guessDay } from "../../utils";
import { connectToBrowser } from "../../utils/browser";
import { updateSchedule } from "../../utils/time";

export const command = "archive <mosque>";
export const describe = "Scrape a mosque and save the results to db";
export const builder = {};

export interface ArchiveArguments extends Argv {
  mosque: string;
}

function groupByMonth(times: PrayerTimeTable) {
  return groupBy(times, (daySchedule: DaySchedule) => {
    const day = guessDay(daySchedule);
    return day.month;
  });
}

async function updateDB(
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
  console.log(chalk.white(`Updated monthly timetable ${timetableId}`));
}

async function archiveOneMosque(
  collection: Collection,
  browser: Browser,
  mosque: string
) {
  try {
    const result: PrayerTimeTable = await scrape(browser, mosque);
    const groupedByMonth = groupByMonth(result);
    for (const m of Object.keys(groupedByMonth)) {
      const month = parseInt(m, 10);
      if (month === undefined) {
        throw Error(`Bad month: ${month}`);
      }
      await updateDB(collection, mosque, month, groupedByMonth[m]);
    }
    console.log(
      chalk.greenBright.bold(
        `Archived ${result.length} items for mosque ${mosque}`
      )
    );
  } catch (error) {
    console.error(
      chalk.redBright.bold(`Mosque ${mosque} failed with error ${error}`)
    );
  }
}

async function archiveManyMosques(
  collection: Collection,
  browser: Browser,
  mosques: string[]
) {
  for (const mosque of mosques) {
    await archiveOneMosque(collection, browser, mosque);
  }
}

async function handlerAsync(args: ArchiveArguments) {
  const browser = await connectToBrowser();
  try {
    const collection = await openCollection();
    if (args.mosque === "all") {
      await archiveManyMosques(
        collection,
        browser,
        scrapersList.daily.concat(scrapersList.monthly)
      );
    } else if (args.mosque === "daily") {
      await archiveManyMosques(collection, browser, scrapersList.daily);
    } else if (args.mosque === "monthly") {
      await archiveManyMosques(collection, browser, scrapersList.monthly);
    } else {
      await archiveOneMosque(collection, browser, args.mosque);
    }
  } finally {
    await browser.disconnect();
  }
}

export function handler(args: ArchiveArguments) {
  handlerAsync(args).catch(console.error);
}
