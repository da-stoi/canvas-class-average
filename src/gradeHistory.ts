import { GradeHistory, TotalGradeHistory } from "./types";

export function getGradeHistory(courseId: number): GradeHistory[] {

  // Get the grade history from local storage
  const gradeHistory = localStorage.getItem(`average-${courseId}`);

  // If there is no grade history, return an empty array
  if (!gradeHistory) {
    return [];
  }

  const parsedGradeHistory = JSON.parse(gradeHistory);

  // Sort grade history by date
  const sortedGradeHistory = parsedGradeHistory.sort((a: GradeHistory, b: GradeHistory) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });


  // Return the parsed grade history
  return sortedGradeHistory;
}

export function setGradeHistory(courseId: number, gradeHistory: GradeHistory) {

  // Get the current grade history
  const currentGradeHistory = getGradeHistory(courseId);

  // Check if the previous grade history is the same as the new grade history
  if (currentGradeHistory.length > 0
    && currentGradeHistory[currentGradeHistory.length - 1].average === gradeHistory.average
    && currentGradeHistory[currentGradeHistory.length - 1].total === gradeHistory.total) {
    return;
  }

  // Add the new grade history to the current grade history
  currentGradeHistory.push(gradeHistory);

  // Set the new grade history in local storage
  localStorage.setItem(`average-${courseId}`, JSON.stringify(currentGradeHistory));

  return;
}

