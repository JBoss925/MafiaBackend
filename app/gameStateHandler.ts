// This file contains the firebase implementations of the endpoints.

import { Request, Response } from "express-serve-static-core";
import { firestore } from "firebase";
import { StartGameRequest, StepGameRequest, SubmitMoveRequest } from "./requestTypes";
import { Player, Game } from "./types";
import { toNextStep, canStep, performStepAction } from "./util/gameUtils";

export async function startGame(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as StartGameRequest;
  let gameRef = db.collection('games').doc(request.uuid);
  return gameRef.get().then(async (doc) => {
    if (!doc.exists) {
      res.json({ error: "no game with that uuid!" });
    } else {
      let newGameData = doc.data() as Game;
      newGameData.started = true;
      newGameData.time = "night";
      newGameData.currentStep = "mafiaAwake";
      newGameData.round = 1;
      let numMafia = 0;
      for (let i = 0; i < newGameData.currentPlayers.length; i++) {
        let playerDocRef = newGameData.currentPlayers[i];
        let playerData: Player = {} as Player;
        await playerDocRef.get().then((doc) => {
          playerData = doc.data() as Player;
        });
        if (i == 0) {
          playerData.role = "detective";
        }
        else if (i == 1) {
          playerData.role = "doctor";
        }
        else if (i % 2 == 0 && numMafia < 2) {
          playerData.role = "mafia";
          newGameData.numMafia++;
          numMafia++;
        } else {
          playerData.role = "innocent";
          newGameData.numInnocent++;
        }
        await playerDocRef.set(playerData);
      }
      await gameRef.set(newGameData).then(() => {
        res.json(newGameData);
      });
    }
  });
}

export async function stepGame(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as StepGameRequest;
  let gameRef = db.collection('games').doc(request.uuid);
  return gameRef.get().then(async (doc) => {
    if (!doc.exists) {
      res.json({ error: "no game by that uuid!" });
    } else {
      let gameData = doc.data() as Game;
      if (canStep(gameData)) {
        await performStepAction(db, res, gameData);
        gameData.currentStep = toNextStep(gameData.currentStep);
        await gameRef.set(gameData);
        res.json(gameData);
      } else {
        res.json({ error: "cannot step!" });
      }
    }
  });
}

export async function submitMove(db: firestore.Firestore, req: Request, res: Response) {
  let request = req.body as SubmitMoveRequest;
  let gameRef = db.collection('games').doc(request.uuid);
  return gameRef.get().then(async (doc) => {
    if (!doc.exists) {
      res.json({ error: "no game by that uuid!" });
    } else {
      let gameData = doc.data() as Game;
      gameData.pendingMoves.push(request.type + "||" + request.uuid + "->" +
        request.selectedUUID);
      await gameRef.set(gameData);
      res.json(gameData);
    }
  });
}