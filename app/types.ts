// Models

import { firestore } from "firebase";

export type Game = {
  uuid: string;
  currentPlayers: firestore.DocumentReference[];
  started: boolean;
  round: number;
}

export type Player = {
  uuid: string;
  name: string;
  role: string;
}