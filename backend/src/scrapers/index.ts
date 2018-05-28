// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { resolve } from "path";

import { Browser, connect } from "puppeteer";
import { DaySchedule, PrayerTimeTable } from "../types/PrayerTime";
import { scrapersList } from "./list";

interface ScrapeModule {
  scrape: (browser: Browser) => Promise<PrayerTimeTable>;
}

export async function scrape(
  browser: Browser,
  mosque: string
): Promise<PrayerTimeTable> {
  const scraper: ScrapeModule = await import(`${__dirname}/${mosque}.js`);
  const result = await scraper.scrape(browser);
  return result;
}

export * from "./list"; // re-exporting so that it's in the top level
