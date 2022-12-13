import { devLog } from "./devLog";
import { Assignment, GroupScores, WeightGroups } from "./types";

export function getGradesByWeightGroup(assignments: Assignment[], weightGroups: WeightGroups): GroupScores {

  let groupScores: GroupScores = {};

  // For each assignment, calculate the weighted score
  assignments.forEach((assignment: Assignment) => {
    if (assignment.countsTowardsFinal && !assignment.dropped && assignment.hasAverage) {

      if (Object.keys(weightGroups).length <= 1 || !assignment.group || !weightGroups[assignment.group]) {
        assignment.group = 'total';
      }

      // Add the assignment to the group scores
      if (groupScores[assignment.group]) {
        groupScores[assignment.group].score += assignment.score;
        groupScores[assignment.group].average += assignment.average;
        groupScores[assignment.group].possible += assignment.possible;
      } else {
        groupScores[assignment.group] = {
          score: assignment.score,
          average: assignment.average,
          possible: assignment.possible
        }
      }
    }
  });

  devLog('Got grades by weight group.');

  return groupScores;
}