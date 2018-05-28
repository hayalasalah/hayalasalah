// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import fetch from "node-fetch";
import { Browser, connect } from "puppeteer";

async function getBrowserUrl(host = "localhost", port = 9222): Promise<string> {
  const result = await fetch(`http://${host}:${port}/json/version`);
  const data = await result.json();
  return data.webSocketDebuggerUrl;
}

export async function connectToBrowser(
  host = "localhost",
  port = 9222
): Promise<Browser> {
  const url = await getBrowserUrl(host);
  const browser = await connect({ browserWSEndpoint: url });
  return browser;
}
