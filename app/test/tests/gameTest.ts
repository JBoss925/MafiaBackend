import * as gameHandler from '../../gameHandler';
import { firestore } from 'firebase';
import { expect } from '../testExtensions';
import { Game } from '../../types';
var MockExpressRequest = require('mock-express-request');
var MockExpressResponse = require('mock-express-response');


// Begin Tests -----------------------------------------------------------------

export async function runDeleteGameTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/deleteGame/',
      body: {
        uuid: "test_game_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  await gameHandler.deleteGame(db, mockRequest, mockRespsonse);
  let docExists;
  await db.collection('games').doc(mockRequest.body.uuid).get().then(doc => {
    docExists = doc.exists;
  });
  expect(mockRespsonse._getJSON().deleted).toBe.equalTo(true);
  expect(docExists).toBe.equalTo(false);
}

export async function runCreateGameTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/createGame/',
      body: {
        name: "test_game_name",
        uuid: "test_game_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  await gameHandler.createGame(db, mockRequest, mockRespsonse);
  expect(mockRespsonse._getJSON().uuid).is.defined();
  let responseJSON = mockRespsonse._getJSON();
  let docExists;
  let docData: Game = {} as Game;
  await db.collection('games').doc(mockRequest.body.uuid).get().then(doc => {
    docExists = doc.exists;
    docData = doc.data() as Game;
  });
  expect(docExists).toBe.equalTo(true);
  expect(docData.uuid).toBe.equalTo(responseJSON.uuid);
}


export async function runGetGameTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/getPlayer/',
      body: {
        uuid: "test_game_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  await gameHandler.getGame(db, mockRequest, mockRespsonse);
  expect(mockRespsonse._getJSON().uuid).is.defined();
  let responseJSON = mockRespsonse._getJSON();
  let docExists;
  let docData: Game = {} as Game;
  await db.collection('games').doc(mockRequest.body.uuid).get().then(doc => {
    docExists = doc.exists;
    docData = doc.data() as Game;
  });
  expect(docExists).toBe.equalTo(true);
  expect(docData.uuid).toBe.equalTo(responseJSON.uuid);
}

export async function runAddPlayerToGameTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/getPlayer/',
      body: {
        gameUUID: "test_game_uuid",
        playerUUID: "test_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  // Get the player docRef
  let playerDocRef = db.collection('players').doc(mockRequest.body.playerUUID);
  await gameHandler.addPlayerToGame(db, mockRequest, mockRespsonse);
  expect(mockRespsonse._getJSON().uuid).is.defined();
  let responseJSON = mockRespsonse._getJSON();
  let docExists;
  let docData: Game = {} as Game;
  await db.collection('games').doc(mockRequest.body.gameUUID).get().then(doc => {
    docExists = doc.exists;
    docData = doc.data() as Game;
  });
  expect(docExists).toBe.equalTo(true);
  expect(docData.uuid).toBe.equalTo(responseJSON.uuid);
  expect(docData.currentPlayers.map(val => val.id).includes(playerDocRef.id)).toBe.equalTo(true);
}

export async function runDeletePlayerFromGameTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/getPlayer/',
      body: {
        gameUUID: "test_game_uuid",
        playerUUID: "test_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  // Get the player docRef
  let playerDocRef = db.collection('players').doc(mockRequest.body.playerUUID);
  // Check that the game has the playerref
  let gameDataPrev: Game = {} as Game;
  let gamePrevDocExists;
  await db.collection('games').doc(mockRequest.body.gameUUID).get().then(doc => {
    gamePrevDocExists = doc.exists;
    gameDataPrev = doc.data() as Game;
  });
  expect(gamePrevDocExists).toBe.equalTo(true);
  expect(gameDataPrev.currentPlayers.map(val => val.id).includes(playerDocRef.id)).toBe.equalTo(true);
  // Delete the player
  await gameHandler.deletePlayerFromGame(db, mockRequest, mockRespsonse);
  expect(mockRespsonse._getJSON().uuid).is.defined();
  let responseJSON = mockRespsonse._getJSON();
  let docExists;
  let docData: Game = {} as Game;
  await db.collection('games').doc(mockRequest.body.gameUUID).get().then(doc => {
    docExists = doc.exists;
    docData = doc.data() as Game;
  });
  expect(docExists).toBe.equalTo(true);
  expect(docData.uuid).toBe.equalTo(responseJSON.uuid);
  expect(docData.currentPlayers.map(val => val.id).includes(playerDocRef.id)).toBe.equalTo(false);
}
