// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Collection } from "documentdb-typescript";
import Router from "koa-router";
import {
  getTimesForMonth,
  getTimesForToday,
  getTimesForYear
} from "../database";

interface MosqueRouterParams {
  region: string;
  mosque: string;
}

export function buildRouter(collection: Collection): Router {
  const mosqueRouter = new Router();
  mosqueRouter.get("today", async ctx => {
    const params = ctx.params as MosqueRouterParams;
    const tag = `${params.region}/${params.mosque}`;
    ctx.body = await getTimesForToday(collection, tag);
  });

  mosqueRouter.get("month", async ctx => {
    const params = ctx.params as MosqueRouterParams;
    const tag = `${params.region}/${params.mosque}`;
    ctx.body = await getTimesForMonth(collection, tag);
  });

  mosqueRouter.get("year", async ctx => {
    const params = ctx.params as MosqueRouterParams;
    const tag = `${params.region}/${params.mosque}`;
    ctx.body = await getTimesForYear(collection, tag);
  });

  return mosqueRouter;
}
