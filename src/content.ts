import { getAssignments } from "./getAssignments";
import { getClassAverage } from "./getClassAverage";
import { getGradeHistory, appendGradeHistory } from "./storage";
import {
  displayAverage,
  displayAverageByWeightGroup,
  displayGradeChange,
  displayGradeHistory,
  displayScoreByWeightGroup,
} from "./displayGradeData";
import { getUserScore } from "./getUserScore";
import { getCourseId } from "./getCourseId";
import { configureSettings, displaySettings } from "./settings";
import { getSettings } from "./storage";
import { getWeightGroups } from "./getWeightGroups";
import { Assignment, WeightGroups } from "./types";
import { displayInaccuracies } from "./getInaccuracies";
import { setOnlyGradedAssignmentsHandler } from "./onlyGradedAssignmentsToggle";
import { averagesPublished } from "./averagesPublished";

async function gradesPage() {

  // Get settings
  const settings = await getSettings();

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

  // If the instructor has not published the averages, display a message and return
  if (averagesPublished(assignments) === false) {
    displayAverage(false, userScore, []);
    return;
  }

  // Set the grade history only if the class average and user score are defined
  if (classAverage && userScore) {
    await appendGradeHistory(courseId, classAverage, userScore);
  }

  // Get the grade history
  const gradeHistory = await getGradeHistory(courseId);

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