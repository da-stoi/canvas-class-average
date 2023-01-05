import { devLog } from "./devLog";
import { Assignment } from "./types";

// Get all assignments
export function getAssignments(): Assignment[] {

  let assignments: Assignment[] = [];

  // Get grade summary table
  const gradeSummary = Array.from(document.getElementById('grades_summary')?.getElementsByTagName('tbody')[0].getElementsByTagName('tr') || []);

  // Return empty assignments array if there is no grade summary
  if (!gradeSummary) {
    return assignments;
  }

  // Loop through each row in the grade summary table
  gradeSummary.forEach(assignment => {

    let hasAverage: boolean = false;
    const fullAssignmentId: string = assignment.id;

    // Only process unique assignments
    if (!fullAssignmentId.includes('submission') || fullAssignmentId.includes('group') || fullAssignmentId.includes('final')) {
      devLog(`Skipping ${fullAssignmentId}`);
      return;
    }

    // Only process if the assignment has a grade
    if (assignment.querySelector('.grade')?.textContent?.trim().toLowerCase().includes('instructor')) {
      devLog(`Skipping ${fullAssignmentId} because the grade has not been published.`, 'warn');
      return;
    }

    // Parse the assignment id
    const assignmentId: number = parseInt(fullAssignmentId.split('_')[1]);

    // Double check if this works
    // Get the assignment name
    const assignmentName: string = assignment.querySelector('.title a')?.textContent?.trim() || '';

    // Check if the assignment counts towards the final grade
    const countsTowardsFinal: boolean = !document.getElementById(`final_grade_info_${assignmentId}`)?.textContent?.includes('does not count toward the final grade');

    // Check if the assignment is dropped
    const dropped: boolean = assignment.classList.contains('dropped');

    // Check if the assignment is missing
    const isMissing: boolean = assignment.getElementsByClassName('submission-missing-pill').length > 0;

    // Get score details
    const scoreDetails = document.getElementById(`score_details_${assignmentId}`);

    // Set hasAverage to true if scoreDetails exists
    if (scoreDetails) {
      hasAverage = true;
    }

    // Get the assignment average score
    const average: number = parseFloat(scoreDetails?.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].innerText?.trim().split('\n')[1].trim() || '0');

    let score: number = 0;
    // Handle pass/fail assignments
    const gradeElement = assignment.querySelector('.grade');

    // Get the possible score
    const possible: number = parseFloat(gradeElement?.nextElementSibling?.textContent?.split('/')[1].trim() || '0');

    const gradeIcon = gradeElement?.getElementsByTagName('i')[0];
    if (gradeIcon && gradeIcon.classList.contains('icon-check')) {
      score = possible;
    } else if (gradeIcon && gradeIcon.classList.contains('icon-x')) {
      score = 0;
    } else {
      // Get user's score for the assignment
      const gradeText = gradeElement?.textContent?.trim().split('\n') || [];
      score = parseFloat(gradeText[gradeText.length - 1] === '-' ? '0' : gradeText[gradeText.length - 1] || '0');
    }

    // Get assignment group
    const group: string = assignment.querySelector('.title .context')?.textContent?.trim().toLowerCase() || '';

    // Create assignment object
    const assignmentObject: Assignment = {
      assignmentId,
      assignmentName,
      score,
      average,
      possible,
      group,
      dropped,
      countsTowardsFinal,
      hasAverage,
      isMissing
    };

    // Push assignment to assignments array
    assignments.push(assignmentObject);
  });

  devLog('Got assignments.');

  return assignments;
}