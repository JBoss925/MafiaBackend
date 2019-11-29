import * as playerHandler from '../../playerHandler';
import { firestore } from 'firebase';
import { expect } from '../testExtensions';
import * as runTests from '../runTests';
import { materialize } from '../../util/commonOps';
var MockExpressRequest = require('mock-express-request');
var MockExpressResponse = require('mock-express-response');


// Begin Tests -----------------------------------------------------------------

export async function runDeletePlayerTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/deletePlayer/',
      body: {
        uuid: "test_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  await playerHandler.deletePlayer(db, mockRequest, mockRespsonse);
  let docExists;
  await db.collection('players').doc(mockRequest.body.uuid).get().then(doc => {
    docExists = doc.exists;
  });
  expect(mockRespsonse._getJSON().deleted).toBe.equalTo(true);
  expect(docExists).toBe.equalTo(false);
}

export async function runCreatePlayerTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/createPlayer/',
      body: {
        name: "test_name",
        uuid: "test_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  await playerHandler.createPlayer(db, mockRequest, mockRespsonse);
  expect(mockRespsonse._getJSON().uuid).is.defined();
  let responseJSON = mockRespsonse._getJSON();
  let docExists;
  let docData: any;
  await db.collection('players').doc(responseJSON.uuid).get().then(doc => {
    docExists = doc.exists;
    docData = doc.data();
  });
  expect(docExists).toBe.equalTo(true);
  expect(docData.uuid).toBe.equalTo(responseJSON.uuid);
}


export async function runGetPlayerTest(db: firestore.Firestore) {
  let mockRequest = new MockExpressRequest(
    {
      method: 'POST',
      url: '/getPlayer/',
      body: {
        uuid: "test_uuid"
      }
    }
  );
  let mockRespsonse = new MockExpressResponse();
  await playerHandler.getPlayer(db, mockRequest, mockRespsonse);
  expect(mockRespsonse._getJSON().uuid).is.defined();
  let responseJSON = mockRespsonse._getJSON();
  let docExists;
  let docData: any;
  await db.collection('players').doc(responseJSON.uuid).get().then(doc => {
    docExists = doc.exists;
    docData = doc.data();
  });
  expect(docExists).toBe.equalTo(true);
  expect(docData.uuid).toBe.equalTo(responseJSON.uuid);
}
