export class Stake {
  stakeId: number;
  title: string;
  player: Player[];
  createTime?: number;
  winner?: number;
  winPoint?: number;
}

export class Player {
  playerId: number;
  playerName?: string;
  point?: number;
}
