// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// tslint:disable:no-console

import { Argv } from "yargs";

import chalk from "chalk";
import { getScraperType, scrape } from "../../scrapers";
import {
  DaySchedule,
  Prayer,
  PrayerName,
  PrayerTimeTable
} from "../../types/PrayerTime";
import { connectToBrowser } from "../utils/browser";
import { FRIDAY, guessDay } from "../utils/time";

export const command = "scrape <mosque>";
export const describe = "Scrape a mosque and pretty print the result";
export const builder = {};

export interface ScrapeArguments extends Argv {
  mosque: string;
}

const prayerName = chalk.bold.green;

function printSingleJamat(name: PrayerName, prayer: Prayer) {
  const adhan = prayer.adhan ? prayer.adhan.toFormat("HH:mm") : "-";
  const iqamah = prayer.iqamah.toFormat("HH:mm");
  console.log(`\t${prayerName(name)}\t${adhan}\t${iqamah}`);
}

function printMultipleJamat(name: PrayerName, jamats: Prayer[]) {
  console.log(`\t${prayerName(name)}`);
  for (const jamat of jamats) {
    const adhan = jamat.adhan ? jamat.adhan.toFormat("HH:mm") : "-";
    const iqamah = jamat.iqamah.toFormat("HH:mm");
    console.log(`\t\t${adhan}\t${iqamah}`);
  }
}

function printPrayer(name: PrayerName, prayer: Prayer | Prayer[] | undefined) {
  if (prayer === undefined) {
    console.log(`\t${prayerName(name)}`);
  } else if (Array.isArray(prayer)) {
    printMultipleJamat(name, prayer);
  } else {
    printSingleJamat(name, prayer);
  }
}

function printDay(schedule: DaySchedule) {
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

function printTimeTable(table: PrayerTimeTable) {
  for (const day of table) {
    printDay(day);
  }
}

async function handlerAsync(args: ScrapeArguments) {
  if (getScraperType(args.mosque) === undefined) {
    console.error(`Unknown scraper ${args.mosque}`);
    return;
  }
  const browser = await connectToBrowser();
  try {
    const result = await scrape(browser, args.mosque);
    printTimeTable(result);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.disconnect();
  }
}

export function handler(args: ScrapeArguments) {
  handlerAsync(args).catch(console.error);
}
