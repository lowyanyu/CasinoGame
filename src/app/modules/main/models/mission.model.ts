export enum MissionType {
  IMAGE = 1,
  CHOOSE = 2,
  SHORT_TEXT = 3,
  NUMBER = 4
}

export enum MissionStatus {
  INIT = 0,
  SUCCESS = 1,
  FAIL = 2,
  PENDING = 3,
  IMG_UPLOADING = 4
}

export class Mission {
  missionId: number;
  missionTitle: string;
  missionContent: string;
  missionType: 1 | 2 | 3 | 4;
  missionRequire: {number: number, unit: string};
  missionReward: number;
  missionStatus: 0 | 1 | 2 | 3 | 4;
  missionOption?: {optionId: string, optionName: string};
  missionImg: string | {src: string, disp: 'h' | 'v'}[];
  exampleImg?: string;
  answer?: string | string[];
  score?: number;
}
