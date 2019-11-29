// Models

import { firestore } from "firebase";

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

export type Game = {
  uuid: string;
  currentPlayers: firestore.DocumentReference[];
  pendingMoves: string[];
  started: boolean;
  round: number;
  time: string;
  currentStep: string;
  numMafia: number;
  numInnocent: number;
}

export type Player = {
  uuid: string;
  name: string;
  role: string;
  isProtected: boolean;
  isTargeted: boolean;
  isSuspected: boolean;
  isAccused: boolean;
  numVotesAgainst: number;
}

/**
 * type can be:
 * 
 * - "mafiaKill"
 * - "detectiveChoose"
 * - "doctorChoose"
 * - "accusation"
 * - "vote"
 */
export type Move = {
  uuid: string;
  type: string;
  selectedUUID: string;
}