export enum Choice {
  YES = 1,
  NO = 2,
  SKIP = 3
}

export class Question {
  questionId: number;
  questionContent: string;
  score: number;
  choose: 1 | 2 | 3;
}
