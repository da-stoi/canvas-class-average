import { Assignment } from "./types";

export function averagesPublished(assignments: Assignment[]) {
  // If all assignments are missing averages, return false
  let hasAverage = false;
  assignments.forEach(assignment => {
    if (assignment.hasAverage) {
      hasAverage = true;
    }
  });

  return hasAverage;
}