import { getGradesByWeightGroup } from "./getGradesByWeightGroup";
import { Assignment, GroupScores, WeightGroups } from "./types";

export function getClassAverage(assignmentList: Assignment[], weightGroups: WeightGroups): number {

  // Get group scores
  const groupScores: GroupScores = getGradesByWeightGroup(assignmentList, weightGroups);

  let classAverage = 0;

  // Calculate the total score
  for (const group in groupScores) {
    const groupScore = groupScores[group];
    classAverage += (groupScore.average / groupScore.possible) * weightGroups[group];
  }

  // Adjust total for missing weight group averages
  for (const group in weightGroups) {
    if (!groupScores[group] && group !== 'total' && weightGroups[group] > 0) {
      weightGroups.total -= weightGroups[group];
    }
  }


  // Return the average of all assignments
  return classAverage / weightGroups.total;
}