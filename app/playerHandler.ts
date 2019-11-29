// This file contains the firebase implementations of the endpoints.


import { Request, Response } from "express-serve-static-core";
import { firestore } from "firebase";
import * as commonOps from "./util/commonOps";
import { v4 as uuid } from 'uuid';
import { CreatePlayerRequest, GetPlayerRequest, DeletePlayerRequest } from "./requestTypes";
import { Player } from "./types";
import { isUndefined } from "util";

export async function createPlayer(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as CreatePlayerRequest;
  let userObj: Player;
  if (isUndefined(request.uuid)) {
    userObj = {
      uuid: uuid(),
      name: request.name,
      role: "unset",
      isProtected: false,
      isTargeted: false,
      isSuspected: false,
      isAccused: false,
      numVotesAgainst: 0
    };
  } else {
    userObj = {
      uuid: request.uuid,
      name: request.name,
      role: "unset",
      isProtected: false,
      isTargeted: false,
      isSuspected: false,
      isAccused: false,
      numVotesAgainst: 0
    };
  }
  return db.collection('players').doc(userObj.uuid).set(userObj).then(() => {
    res.json(userObj);
  });
}

export async function getPlayer(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as GetPlayerRequest;
  return db.collection('players').doc(request.uuid).get().then((doc) => {
    if (!doc.exists) {
      res.json({ error: "no user by that name!" });
    } else {
      res.json(doc.data());
    }
  });
}

export async function deletePlayer(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as DeletePlayerRequest;
  return db.collection('players').doc(request.uuid).delete().then(() => {
    res.json({ deleted: true });
  })
}