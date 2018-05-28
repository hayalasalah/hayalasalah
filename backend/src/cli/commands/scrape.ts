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
import { connectToBrowser } from "../../utils/browser";
import { printTimeTable } from "../../utils/print";

export const command = "scrape <mosque>";
export const describe = "Scrape a mosque and pretty print the result";
export const builder = {};

export interface ScrapeArguments extends Argv {
  mosque: string;
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
