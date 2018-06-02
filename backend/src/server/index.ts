#!/usr/bin/env node

// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import "../database/env"; // necessary to run

import Koa from "koa";
import Router from "koa-router";
import { openCollection } from "../database";
import { buildRouter } from "./mosquerouter";

const app = new Koa();

openCollection().then(collection => {
  const mosqueRouter = buildRouter(collection);

  const mainRouter = new Router();
  mainRouter.use(
    "/mosques/:region/:mosque/",
    mosqueRouter.routes(),
    mosqueRouter.allowedMethods()
  );

  app.use(mainRouter.routes());
  app.listen(3000);
});
