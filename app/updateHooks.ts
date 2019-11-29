import { Request, Response } from "express-serve-static-core";
import { firestore } from "firebase";
import * as commonOps from "./util/commonOps";
import { v4 as uuid } from 'uuid';
const functions = require('firebase-functions');

// exports.useWildcard = functions.firestore
//   .document('users/{userId}')
//   .onUpdate((change, context) => {
//     // If we set `/users/marie` to {name: "Marie"} then
//     // context.params.userId == "marie"
//     // ... and ...
//     // change.after.data() == {name: "Marie"}
//   });