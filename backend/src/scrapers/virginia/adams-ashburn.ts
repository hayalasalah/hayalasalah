// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Browser } from "puppeteer";
import { DaySchedule, PrayerTimeTable } from "../../types/PrayerTime";
import { stringToDateTime } from "../utils";
import { scrapeAdams } from "./adams";

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const daySchedule = await scrapeAdams(browser);
  daySchedule.jummah = [
    {
      confidence: 100,
      iqamah: stringToDateTime("11:45", "HH:mm", "America/New_York")
    },
    {
      confidence: 100,
      iqamah: stringToDateTime("12:45", "HH:mm", "America/New_York")
    },
    {
      confidence: 100,
      iqamah: stringToDateTime("13:45", "HH:mm", "America/New_York")
    },
    {
      confidence: 100,
      iqamah: stringToDateTime("14:30", "HH:mm", "America/New_York")
    }
  ];

  return [daySchedule];
}
