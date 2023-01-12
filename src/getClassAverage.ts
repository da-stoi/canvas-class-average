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

    const weightMultiplier = weightGroups[group] > 1 ? 1 : weightGroups[group];

    classAverage += (groupScore.average / groupScore.possible) * weightMultiplier;
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

  // If there is a missing weight, add it
  if (totalMissingWeight > 0) {
    // Return the average of all assignments
    return classAverage + totalMissingWeight;
  }

  // Return the average of all assignments
  return classAverage;
}