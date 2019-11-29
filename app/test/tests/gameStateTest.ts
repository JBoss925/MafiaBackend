import { Player, Game } from "../../types";
import { firestore } from "firebase";
import { expect } from '../testExtensions';
import * as gameStateHandler from '../../gameStateHandler';
var MockExpressRequest = require('mock-express-request');
var MockExpressResponse = require('mock-express-response');

// NOTE: do not rearrange function order in this file, it is necessary
// that the test state is created and mutated in a specific order to simulate
// the progress of a game.

async function createTestGameState(db: firestore.Firestore) {
  let playerRefs = [];
  for (let i = 0; i < 7; i++) {
    let playerStruct: Player = {
      uuid: "player" + i + "uuid",
      name: "player " + i,
      role: "unset",
      isProtected: false,
      isTargeted: false,
      isSuspected: false,
      isAccused: false,
      numVotesAgainst: 0
    } as Player;
    let playerRef = db.collection('players').doc(playerStruct.uuid);
    await playerRef.set(playerStruct);
    playerRefs.push(playerRef);
  }
  let game: Game = {
    uuid: "test_game_state_uuid",
    currentPlayers: playerRefs,
    pendingMoves: [],
    started: false,
    round: 0,
    time: "unset",
    currentStep: "unset",
    numMafia: 0,
    numInnocent: 0
  } as Game;
  let gameRef = db.collection('games').doc(game.uuid);
  await gameRef.set(game);
}

export async function runStartGameTest(db: firestore.Firestore) {
  await createTestGameState(db);
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/startGame/',
      body: {
        uuid: "test_game_state_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  await gameStateHandler.startGame(db, mockRequest, mockRespsonse);
  let gameRef = db.collection('games').doc(mockRequest.body.uuid);
  let gameData: Game = {} as Game;
  await gameRef.get().then((doc) => {
    if (!doc.exists) {
      mockRespsonse.json({ error: "Cannot start game! Game with that uuid does not exist!" })
    } else {
      gameData = doc.data() as Game;
    }
  });
  expect(gameData.uuid).toBe.equalTo("test_game_state_uuid");
  expect(gameData.time).toBe.equalTo("night");
  expect(gameData.currentStep).toBe.equalTo("mafiaAwake");
  expect(gameData.started).toBe.equalTo(true);
  expect(gameData.numMafia).toBe.equalTo(2);
  expect(gameData.numInnocent).toBe.equalTo(3);
  expect(gameData.round).toBe.equalTo(1);
}