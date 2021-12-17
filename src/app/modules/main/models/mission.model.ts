export enum MissionType {
  IMAGE = 1,
  CHOOSE = 2,
  SHORT_TEXT = 3
}

export enum MissionStatus {
  INIT = 0,
  SUCCESS = 1,
  FAIL = 2,
  PENDING = 3
}

export class Mission {
  missionId: number;
  missionTitle: string;
  missionContent: string;
  missionType: 1 | 2 | 3;
  missionRequire: number;
  missionReward: number;
  missionStatus: 0 | 1 | 2 | 3;
}
