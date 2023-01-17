import { displayGradeChange, updateAverageAndScoreByWeightGroup, updateAverageDisplay } from "./displayGradeData";
import { getClassAverage } from "./getClassAverage";
import { getUserScore } from "./getUserScore";
import { Assignment, GradeHistory, WeightGroups } from "./types";

// Get state of only graded assignments checkbox
export function onlyGradedAssignments(): boolean {
  // Get the checkbox
  const checkbox = document.getElementById("only_consider_graded_assignments") as HTMLInputElement;
  const onlyGradedAssignments = checkbox.checked;

  return onlyGradedAssignments;
}

// Update grade data based on only graded assignments state
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

// Set only graded assignments handler
export function setOnlyGradedAssignmentsHandler(gradeHistory: GradeHistory[], assignments: Assignment[], weightGroups: WeightGroups) {
  const checkbox = document.getElementById("only_consider_graded_assignments") as HTMLInputElement;
  checkbox.addEventListener("change", () => {
    // Update the average
    updateGradeData(gradeHistory, assignments, weightGroups);
  });
}