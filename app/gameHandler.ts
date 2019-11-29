// This file contains the firebase implementations of the endpoints.

import { Request, Response } from "express-serve-static-core";
import { firestore } from "firebase";
import * as commonOps from "./util/commonOps";
import { v4 as uuid } from 'uuid';
import { CreatePlayerRequest, GetPlayerRequest, DeletePlayerRequest, GetGameRequest, DeleteGameRequest, AddPlayerToGameRequest, DeletePlayerFromGameRequest } from "./requestTypes";
import { Player, Game } from "./types";
import { isUndefined } from "util";

export async function createGame(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as CreatePlayerRequest;
  let game: Game;
  if (isUndefined(request.uuid)) {
    game = {
      uuid: uuid().slice(0, 6),
      started: false,
      round: 0,
      currentPlayers: []
    };
  } else {
    game = {
      uuid: request.uuid,
      started: false,
      round: 0,
      currentPlayers: []
    };
  }
  return db.collection('games').doc(game.uuid).set(game).then(() => {
    res.json(game);
  });
}

export async function getGame(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as GetGameRequest;
  return db.collection('games').doc(request.uuid).get().then((doc) => {
    if (!doc.exists) {
      res.json({ error: "no game by that uuid!" });
    } else {
      res.json(doc.data());
    }
  });
}

export async function deleteGame(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as DeleteGameRequest;
  return db.collection('games').doc(request.uuid).delete().then(() => {
    res.json({ deleted: true });
  })
}

export async function addPlayerToGame(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as AddPlayerToGameRequest;
  let gameDataRef = db.collection('games').doc(request.gameUUID)
  return gameDataRef.get().then(async (doc) => {
    if (!doc.exists) {
      res.json({ error: "no game by that uuid!" });
    } else {
      let gameObj = doc.data() as Game;
      let playerDataRef = db.collection('players').doc(request.playerUUID);
      await db.collection('players').doc(request.playerUUID).get().then(async (doc2) => {
        if (!doc2.exists) {
          res.json({ error: "no player by that uuid!" });
        } else {
          let playerObj = doc2.data() as Player;
          gameObj.currentPlayers.push(playerDataRef);
          await gameDataRef.set(gameObj).then(() => {
            res.json(gameObj);
          });
        }
      });
    }
  });
}

export async function deletePlayerFromGame(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as DeletePlayerFromGameRequest;
  let gameDataRef = db.collection('games').doc(request.gameUUID)
  return gameDataRef.get().then(async (doc) => {
    if (!doc.exists) {
      res.json({ error: "no game by that uuid!" });
    } else {
      let gameObj = doc.data() as Game;
      let playerDataRef = db.collection('players').doc(request.playerUUID);
      await db.collection('players').doc(request.playerUUID).get().then(async (doc2) => {
        if (!doc2.exists) {
          res.json({ error: "no player by that uuid!" });
        } else {
          let playerObj = doc2.data() as Player;
          gameObj.currentPlayers = gameObj.currentPlayers.filter((val) => {
            return val.id != playerDataRef.id;
          });
          await gameDataRef.set(gameObj).then(() => {
            res.json(gameObj);
          });
        }
      });
    }
  });
}