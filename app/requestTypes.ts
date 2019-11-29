// Request Types

// Player Types
export type CreatePlayerRequest = {
  name: string;
  uuid?: string
}

export type GetPlayerRequest = {
  uuid: string;
}

export type DeletePlayerRequest = {
  uuid: string;
}

// Game Types
export type CreateGameRequest = {
  name: string;
  uuid?: string;
}

export type GetGameRequest = {
  uuid: string;
}

export type DeleteGameRequest = {
  uuid: string;
}

export type AddPlayerToGameRequest = {
  gameUUID: string;
  playerUUID: string;
}

export type DeletePlayerFromGameRequest = {
  gameUUID: string;
  playerUUID: string;
}