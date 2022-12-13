import { getAssignments } from "./getAssignments";
import { getClassAverage } from "./getClassAverage";
import { getGradeHistory, setGradeHistory } from "./gradeHistory";
import {
  displayAverage,
  displayAverageByWeightGroup,
  displayGradeChange,
  displayGradeHistory,
  displayScoreByWeightGroup,
} from "./displayGradeData";
import { getUserScore } from "./getUserScore";
import { getCourseId } from "./getCourseId";
import { configureSettings, displaySettings, getSettings } from "./settings";
import { getWeightGroups } from "./getWeightGroups";
import { Assignment, WeightGroups } from "./types";
import { displayInaccuracies } from "./getInaccuracies";
import { setOnlyGradedAssignmentsHandler } from "./onlyGradedAssignmentsToggle";

function gradesPage() {

  // Get settings
  const settings = getSettings();

  // Get the course ID
  const courseId: number = getCourseId();

  // Get all assignments
  const assignments: Assignment[] = getAssignments();

  // Get weight groups
  const weightGroups: WeightGroups = getWeightGroups();

  // Get the class average
  const classAverage: number = getClassAverage(assignments, weightGroups);

  // Get user score
  const userScore: number = getUserScore();

  // Set the grade history only if the class average and user score are defined
  if (classAverage && userScore) {
    setGradeHistory(courseId, {
      date: new Date(),
      average: classAverage,
      total: userScore
    });
  }

  // Get the grade history
  const gradeHistory = getGradeHistory(courseId);

  // Set only graded assignments handler
  setOnlyGradedAssignmentsHandler(gradeHistory, assignments, weightGroups);

  // Display the class average
  displayAverage(classAverage, userScore, gradeHistory);

  // Display grade change
  if (settings.gradeChange.value) {
    displayGradeChange(gradeHistory);
  }

  // Display grade history
  if (settings.gradeHistory.value) {
    displayGradeHistory(gradeHistory);
  }

  // Display inaccuracies
  if (settings.inaccuracies.value) {
    displayInaccuracies(assignments, weightGroups);
  }

  // Display average by weight group
  if (settings.averageByWeightGroup.value) {
    displayAverageByWeightGroup(assignments, weightGroups, classAverage);
  }

  // Display user score by weight group
  if (settings.scoreByWeightGroup.value) {
    displayScoreByWeightGroup(assignments, weightGroups, userScore);
  }

}

// Configure settings
configureSettings();

// Run grades code or display settings page
const path = window.location.pathname;
if (path.includes('grades')) {
  // Wait two seconds for all the data to load
  setTimeout(() => {
    gradesPage();
  }, 2000);
} else if (path.includes('settings')) {
  displaySettings();
}