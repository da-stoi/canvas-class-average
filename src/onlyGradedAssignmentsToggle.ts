import { displayGradeChange, updateAverageAndScoreByWeightGroup, updateAverageDisplay } from "./displayGradeData";
import { getClassAverage } from "./getClassAverage";
import { getUserScore } from "./getUserScore";
import { Assignment, GradeHistory, WeightGroups } from "./types";

export function onlyGradedAssignments(): boolean {
  // Get the checkbox
  const checkbox = document.getElementById("only_consider_graded_assignments") as HTMLInputElement;
  const onlyGradedAssignments = checkbox.checked;

  return onlyGradedAssignments;
}

function updateGradeData(gradeHistory: GradeHistory[], assignments: Assignment[], weightGroups: WeightGroups) {

  const average = getClassAverage(assignments, weightGroups);
  const userScore = getUserScore();

  // Update the average
  updateAverageDisplay(average, userScore, gradeHistory);

  // Update user's score
  displayGradeChange(gradeHistory);

  // Update totals in weight table
  updateAverageAndScoreByWeightGroup(average, userScore);
}

export function setOnlyGradedAssignmentsHandler(gradeHistory: GradeHistory[], assignments: Assignment[], weightGroups: WeightGroups) {
  const checkbox = document.getElementById("only_consider_graded_assignments") as HTMLInputElement;
  checkbox.addEventListener("change", () => {
    // Update the average
    updateGradeData(gradeHistory, assignments, weightGroups);
  });
}