import { Assignment } from './types';

// Check if averages are published for an array of assignments
export function averagesPublished(assignments: Assignment[]) {
  // If all assignments are missing averages, return false
  let hasAverage = false;
  assignments.forEach((assignment) => {
    if (assignment.hasAverage) {
      hasAverage = true;
    }
  });

  return hasAverage;
}
