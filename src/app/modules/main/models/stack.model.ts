export class Stack {
  stackId: number;
  title: string;
  player: Player[];
  createTime?: number;
  winner?: number;
  winPoint?: number;
}

class Player {
  playerId: number;
  playerName: string;
  point?: number;
}
