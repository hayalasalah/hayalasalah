#!/usr/bin/env node

// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import "../database/env"; // necessary to run

import * as yargs from "yargs";

import * as addMosqueCommand from "./commands/addmosque";
import * as archiveCommand from "./commands/archive";
import * as lookupCommand from "./commands/lookup";
import * as scrapeCommand from "./commands/scrape";

// Enable if debugging
// import { Settings } from "luxon";
// Settings.throwOnInvalid = true;

// tslint:disable-next-line:no-unused-expression
yargs
  .command(addMosqueCommand)
  .command(archiveCommand)
  .command(lookupCommand)
  .command(scrapeCommand)
  .demandCommand()
  .help().argv;
