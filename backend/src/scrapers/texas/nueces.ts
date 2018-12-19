// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DateTime } from "luxon";
import fetch from "node-fetch";
import { Browser } from "puppeteer";
import { DaySchedule, Prayer, PrayerTimeTable } from "../../types/PrayerTime";
import { stringToDateTime } from "../utils";

// tslint:disable-next-line:no-var-requires
const parseXml = require("@rgrove/parse-xml");

function getText(iqamah: any, index: number): string {
  return iqamah.children[index].children[0].text;
}

function getHourMinute(text: string): number[] {
  const pieces = text.split(":");
  return [parseInt(pieces[0], 10), parseInt(pieces[1], 10)];
}

function buildTime(base: DateTime, text: string): DateTime {
  const [hour, minute] = getHourMinute(text);
  return base.set({
    hour,
    minute
  });
}

function parseDay(iqamah: any): DaySchedule {
  const dateText = getText(iqamah, 1);
  const baseDate = stringToDateTime(dateText, "y-MM-dd", "America/Chicago");

  if (baseDate.year !== DateTime.local().year) {
    return {};
  }

  const fajr: Prayer = {
    adhan: buildTime(baseDate, getText(iqamah, 5)),
    iqamah: buildTime(baseDate, getText(iqamah, 7)),
    confidence: 100
  };

  const zuhr: Prayer = {
    adhan: buildTime(baseDate, getText(iqamah, 11)),
    iqamah: buildTime(baseDate, getText(iqamah, 13)),
    confidence: 100
  };

  const asr: Prayer = {
    adhan: buildTime(baseDate, getText(iqamah, 17)),
    iqamah: buildTime(baseDate, getText(iqamah, 19)),
    confidence: 100
  };

  const isha: Prayer = {
    adhan: buildTime(baseDate, getText(iqamah, 23)),
    iqamah: buildTime(baseDate, getText(iqamah, 25)),
    confidence: 100
  };

  const sunset = buildTime(baseDate, getText(iqamah, 21));
  const maghrib: Prayer = {
    adhan: sunset,
    iqamah: sunset.plus({ minutes: 5 }),
    confidence: 100
  };
  const jummah = [
    {
      confidence: 100,
      iqamah: stringToDateTime("13:05", "HH:mm", "America/Chicago")
    },
    {
      confidence: 100,
      iqamah: stringToDateTime("14:05", "HH:mm", "America/Chicago")
    }
  ];

  return {
    fajr,
    zuhr,
    asr,
    maghrib,
    isha,
    jummah
  };
}

export async function scrape(browser: Browser): Promise<PrayerTimeTable> {
  const result = await fetch(
    "http://iqamatime.com/members/nuecesmosque.imam-gmail/TimingsXML.xml"
  );
  const resultXMLstring = await result.text();
  const xmlData: any = parseXml(resultXMLstring).children[0];

  const timetable: PrayerTimeTable = [];
  for (const child of xmlData.children) {
    if (child.type === "text") {
      continue;
    }

    const day = parseDay(child);
    if (day.fajr === undefined) {
      continue;
    }

    timetable.push(day);
  }

  return timetable;
}
