// Copyright (c) 2018 Hay Ala Salah
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

export const config = {
  collectionName: process.env.DB_COLLECTION || "",
  dbName: process.env.DB_NAME || "",
  url: process.env.DB_URL || "",
  privateKey: process.env.DB_KEY || ""
};
