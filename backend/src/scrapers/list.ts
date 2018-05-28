// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export type ScraperType = "daily" | "monthly";

export type ScrapersList = { [T in ScraperType]: string[] };

export const scrapersList: ScrapersList = {
  daily: [
    "texas/brushycreek",
    "texas/nueces",
    "washington/icor",
    "arkansas/icnwa",
    "virginia/adams-ashburn",
    "virginia/adams-chantilly",
    "virginia/adams-gainsville",
    "virginia/adams-sterling",
    "houston/alsalam"
  ],
  monthly: ["oregon/bilal", "oregon/assaber", "texas/namcc", "washington/maps"]
};

export function getScraperType(mosque: string): ScraperType | undefined {
  if (scrapersList.daily.indexOf(mosque) !== -1) {
    return "daily";
  }

  if (scrapersList.monthly.indexOf(mosque) !== -1) {
    return "monthly";
  }

  return undefined;
}
