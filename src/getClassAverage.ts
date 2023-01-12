import { getGradesByWeightGroup } from "./getGradesByWeightGroup";
import { onlyGradedAssignments } from "./onlyGradedAssignmentsToggle";
import { Assignment, GroupScores, WeightGroups } from "./types";

// Get class average from assignments array and weight groups
export function getClassAverage(assignments: Assignment[], weightGroups: WeightGroups): number {

  // Get group scores
  const groupScores: GroupScores = getGradesByWeightGroup(assignments, weightGroups);

  let classAverage = 0;

  // Calculate the total score
  for (const group in groupScores) {
    const groupScore = groupScores[group];
    classAverage += (groupScore.average / groupScore.possible) * weightGroups[group];
  }

  // Add percentage for missing weights if only graded assignments is checked
  let totalMissingWeight = 1 - weightGroups.total;
  if (onlyGradedAssignments()) {
    for (const group in weightGroups) {
      if (!groupScores[group] && group !== 'total' && weightGroups[group] > 0) {
        totalMissingWeight += weightGroups[group];
      }
    }
  }

  // Return the average of all assignments
  return classAverage + totalMissingWeight;
}