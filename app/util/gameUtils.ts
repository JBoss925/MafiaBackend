import { Game, Move, Player } from "../types";
import { firestore } from "firebase";
import { Request, Response } from "express-serve-static-core";

//current step
/**
 * start night:
 * 
 * "mafiaAwake" - mafia awake and choose
 *    |
 *    v
 * "detectiveAwake" - detective makes choice
 *    |
 *    v
 * "doctorAwake" - doctor saves person
 *    |
 *    v
 * transition to day
 *    |
 *    v
 * "discussTime" - Give people time to discuss
 *    |
 *    v
 * "makeAccusation" - People can make accusations, another player must second it
 *    |
 *    v
 * "discussAccusation" - If accusation is made, give time to defend it
 *    |
 *    v
 * "accusedVote" - If an accusation is made, hold a vote
 *    |
 *    v
 * "theVerdict" - Releases the verdict
 *    |
 *    v
 * transition to night
 */

export function toNextStep(currentStep: string) {
  switch (currentStep) {
    case ("mafiaAwake"):
      return "detectiveAwake";
    case ("detectiveAwake"):
      return "doctorAwake";
    case ("doctorAwake"):
      return "discussTime";
    case ("discussTime"):
      return "makeAccusation";
    case ("makeAccusation"):
      return "discussAccusation";
    case ("discussAccusation"):
      return "accusedVote";
    case ("accusedVote"):
      return "theVerdict";
    case ("theVerdict"):
      return "mafiaAwake";
  }
  return "ERROR";
}

let parseMove = (moveString: string) => {
  let splits1 = moveString.split("||");
  let moveType = splits1[0];
  let splits2 = splits1[1].split("->");
  let originatorUUID = splits2[0];
  let recipientUUID = splits2[1];
  return {
    uuid: originatorUUID,
    type: moveType,
    selectedUUID: recipientUUID
  } as Move;
}

let getNumMafiaKillMoves = (game: Game) => {
  let sum = 0;
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("mafiaKill")) {
      sum++;
    }
  }
  return sum;
}

let getMafiaKillMoves = (game: Game) => {
  let moves = [];
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("mafiaKill")) {
      moves.push(parseMove(game.pendingMoves[i]));
    }
  }
  return moves;
}

let getNumDetectiveSubmittedMove = (game: Game) => {
  let sum = 0;
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("detectiveChoose")) {
      sum++;
    }
  }
  return sum;
}

let getDetectiveMoves = (game: Game) => {
  let moves = [];
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("detectiveChoose")) {
      moves.push(parseMove(game.pendingMoves[i]));
    }
  }
  return moves;
}

let getNumDoctorSubmittedMove = (game: Game) => {
  let sum = 0;
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("doctorChoose")) {
      sum++;
    }
  }
  return sum;
}

let getDoctorMoves = (game: Game) => {
  let moves = [];
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("doctorChoose")) {
      moves.push(parseMove(game.pendingMoves[i]));
    }
  }
  return moves;
}

let getNumAccusations = (game: Game) => {
  let sum = 0;
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("accusation")) {
      sum++;
    }
  }
  return sum;
}

let getAccusationMoves = (game: Game) => {
  let moves = [];
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("accusation")) {
      moves.push(parseMove(game.pendingMoves[i]));
    }
  }
  return moves;
}

let getNumVotes = (game: Game) => {
  let sum = 0;
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("vote")) {
      sum++;
    }
  }
  return sum;
}

let getVoteMoves = (game: Game) => {
  let moves = [];
  for (let i = 0; i < game.pendingMoves.length; i++) {
    if (game.pendingMoves[i].startsWith("vote")) {
      moves.push(parseMove(game.pendingMoves[i]));
    }
  }
  return moves;
}

export function canStep(game: Game) {
  switch (game.currentStep) {
    case ("mafiaAwake"):
      return game.pendingMoves.length >= 2 && getNumMafiaKillMoves(game) >= 2;
    case ("detectiveAwake"):
      return getNumDetectiveSubmittedMove(game) >= 1;
    case ("doctorAwake"):
      return getNumDoctorSubmittedMove(game) >= 1;
    case ("discussTime"):
      return true;
    case ("makeAccusation"):
      return true;
    case ("discussAccusation"):
      return true;
    case ("accusedVote"):
      return getNumVotes(game) >= game.currentPlayers.length;
    case ("theVerdict"):
      return true;
  }
}

export async function performStepAction(db: firestore.Firestore, res: Response, game: Game) {
  switch (game.currentStep) {
    case ("mafiaAwake"):
      let mafiaKills = getMafiaKillMoves(game);
      for (let i = 0; i < mafiaKills.length; i++) {
        let currMove = mafiaKills[i];
        let playerRef = db.collection('players').doc(currMove.selectedUUID);
        let playerData: Player = {} as Player;
        await playerRef.get().then((doc) => {
          if (!doc.exists) {
            res.json({ error: "cannot kill player! player does not exist!" });
          } else {
            playerData = doc.data() as Player;
          }
        });
        playerData.isTargeted = true;
        await playerRef.set(playerData);
      }
      res.json(game);
    case ("detectiveAwake"):
      let detectiveMoves = getDetectiveMoves(game);
      for (let i = 0; i < detectiveMoves.length; i++) {
        let currMove = detectiveMoves[i];
        let playerRef = db.collection('players').doc(currMove.selectedUUID);
        let playerData: Player = {} as Player;
        await playerRef.get().then((doc) => {
          if (!doc.exists) {
            res.json({ error: "cannot select player! player does not exist!" });
          } else {
            playerData = doc.data() as Player;
          }
        });
        playerData.isSuspected = true;
        await playerRef.set(playerData);
      }
      res.json(game);
    case ("doctorAwake"):
      let doctorMoves = getDoctorMoves(game);
      for (let i = 0; i < doctorMoves.length; i++) {
        let currMove = doctorMoves[i];
        let playerRef = db.collection('players').doc(currMove.selectedUUID);
        let playerData: Player = {} as Player;
        await playerRef.get().then((doc) => {
          if (!doc.exists) {
            res.json({ error: "cannot save player! player does not exist!" });
          } else {
            playerData = doc.data() as Player;
          }
        });
        playerData.isProtected = true;
        await playerRef.set(playerData);
      }
      res.json(game);
    case ("discussTime"):
      return;
    case ("makeAccusation"):
      let accusationMoves = getAccusationMoves(game);
      for (let i = 0; i < accusationMoves.length; i++) {
        let currMove = accusationMoves[i];
        let playerRef = db.collection('players').doc(currMove.selectedUUID);
        let playerData: Player = {} as Player;
        await playerRef.get().then((doc) => {
          if (!doc.exists) {
            res.json({ error: "cannot accuse player! player does not exist!" });
          } else {
            playerData = doc.data() as Player;
          }
        });
        playerData.isAccused = true;
        await playerRef.set(playerData);
      }
      res.json(game);
    case ("discussAccusation"):
      return;
    case ("accusedVote"):
      let voteMoves = getVoteMoves(game);
      for (let i = 0; i < voteMoves.length; i++) {
        let currMove = voteMoves[i];
        let playerRef = db.collection('players').doc(currMove.selectedUUID);
        let playerData: Player = {} as Player;
        await playerRef.get().then((doc) => {
          if (!doc.exists) {
            res.json({ error: "cannot vote for player! player does not exist!" });
          } else {
            playerData = doc.data() as Player;
          }
        });
        playerData.numVotesAgainst++;
        await playerRef.set(playerData);
      }
      res.json(game);
    case ("theVerdict"):
      let playerRefs = game.currentPlayers;
      let maxVotesPlayerRef: firestore.DocumentReference;
      let maxVotesPlayer: Player = { numVotesAgainst: -1 } as Player;
      for (let i = 0; i < playerRefs.length; i++) {
        let playerRef = playerRefs[i];
        await playerRef.get().then((doc) => {
          if (!doc.exists) {
            res.json({ error: "Player left game!" })
          } else {
            let playerData = doc.data() as Player;
            if (maxVotesPlayer.numVotesAgainst < playerData.numVotesAgainst) {
              maxVotesPlayer = playerData;
              maxVotesPlayerRef = playerRef;
            }
          }
        });
      }
      if (maxVotesPlayer.role == "mafia") {
        game.currentPlayers = game.currentPlayers.filter((val) => {
          return val.id != maxVotesPlayerRef.id;
        });
      }
      res.json(game);
  }
}