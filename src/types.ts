export type Assignment = {
  assignmentId: number;
  assignmentName: string;
  score: number;
  average: number;
  possible: number;
  group: string;
  dropped: boolean;
  countsTowardsFinal: boolean;
  hasAverage: boolean;
  isMissing: boolean;
};

export type WeightGroups = {
  [key: string]: number;
  total: number;
};

export type GroupScores = {
  [key: string]: {
    average: number;
    score: number;
    possible: number;
  };
};

export type GradeHistory = {
  date: Date;
  average: number;
  total: number; // Will be renamed to score
};

export type TotalGradeHistory = {
  [key: string]: [
    {
      date: String;
      average: number;
      score: number;
    }
  ];
};

export type Settings = {
  [key: string]: {
    name: string;
    value: boolean;
    description: string;
  };
};
