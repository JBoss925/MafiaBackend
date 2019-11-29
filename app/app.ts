// This file is the entry point of the app and also routes the urls to specific
// handling methods in the handler.

import { Request, Response } from "express-serve-static-core";
import { Express } from "express";
// import * as handler from "./handler";

// Express ---------------------------------------------------------------------
const express = require('express');
const app: Express = express()
const port = 3000;
// -----------------------------------------------------------------------------

// Firebase --------------------------------------------------------------------
var admin = require("firebase-admin");

var serviceAccount = require("../secrets/mafiaonline-806d8-firebase-adminsdk-xbx2d-2132f2b47c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mafiaonline-806d8.firebaseio.com"
});
let db = admin.firestore();
// -----------------------------------------------------------------------------

function main() {
  app.use(express.json());

  app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
}
main();

