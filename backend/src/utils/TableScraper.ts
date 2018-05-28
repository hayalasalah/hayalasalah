// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Frame, Page } from "puppeteer";
import { getDataForXPath, stringToDateTime } from "../scrapers/utils";
import { Prayer } from "../types/PrayerTime";

export interface TableScraperParams {
  adhanXPath?: string;
  iqamahXPath: string;
  timeFormat: string;
  timeZone: string;
  isFajr?: boolean;
}

export async function scrapeTableRow(
  page: Page | Frame,
  params: TableScraperParams
): Promise<Prayer> {
  const addHalfDay = params.isFajr === undefined ? false : !params.isFajr;

  const iqamahString = await getDataForXPath(page, params.iqamahXPath);
  const iqamah = stringToDateTime(
    iqamahString,
    params.timeFormat,
    params.timeZone,
    addHalfDay
  );

  let adhan;
  if (params.adhanXPath !== undefined) {
    const adhanString = await getDataForXPath(page, params.adhanXPath);
    adhan = stringToDateTime(
      adhanString,
      params.timeFormat,
      params.timeZone,
      addHalfDay
    );
  }

  return {
    adhan,
    iqamah,
    confidence: 100
  };
}
