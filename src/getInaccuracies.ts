import { devLog } from "./devLog";
import { getGradesByWeightGroup } from "./getGradesByWeightGroup";
import { Assignment, WeightGroups } from "./types";

function getInaccuracies(assignments: Assignment[], weightGroups: WeightGroups) {

  const inaccuracies = [];

  // Check if there is a weight group table published
  if (Object.keys(weightGroups).length <= 1) {
    inaccuracies.push('Your instructor has not published weight groups. This may cause inaccuracies.');
  }

  // Check if there are any assignments that are dropped
  const droppedAssignments = assignments.filter(assignment => assignment.dropped);
  if (droppedAssignments.length > 0) {
    inaccuracies.push(`You have ${droppedAssignments.length} dropped assignment${droppedAssignments.length > 1 ? 's' : ''}. This may cause inaccuracies.`);
  }

  // Check if there are any assignments missing
  const missingAssignments = assignments.filter(assignment => assignment.isMissing);
  if (missingAssignments.length > 0) {
    inaccuracies.push(`You are missing ${missingAssignments.length} assignment${missingAssignments.length > 1 ? 's' : ''}. This will most likely cause inaccuracies.`);
  }

  // Check if every weight group has an average score
  const gradesByWeightGroup = getGradesByWeightGroup(assignments, weightGroups);
  let weightGroupsWithoutAverage = 0;
  let totalWeightWithoutAverage = 0;
  Object.keys(weightGroups).forEach(weightGroup => {
    if (!gradesByWeightGroup[weightGroup]?.average && weightGroup !== 'total' && weightGroups[weightGroup] > 0) {
      totalWeightWithoutAverage += weightGroups[weightGroup];
      weightGroupsWithoutAverage++;
    }
  });

  if (weightGroupsWithoutAverage > 0) {
    inaccuracies.push(`Average may be off by up to ${(totalWeightWithoutAverage * 100).toFixed(0)}% because ${weightGroupsWithoutAverage} weight group${weightGroupsWithoutAverage === 1 ? ' does' : 's do'} not have an average. Check the Average column in the Weight Groups table for more accurate information.`);
  }

  if (inaccuracies.length > 0) {
    devLog(`Got inaccuracies:\n- ${inaccuracies.join('\n- ')}`, 'warn');
  } else {
    devLog('No inaccuracies found.');
  }

  return inaccuracies;
}

// Display possible inaccuracies in the average
export function displayInaccuracies(assignments: Assignment[], weightGroups: WeightGroups) {
  const finalGradeElement = document.getElementById('student-grades-right-content')?.querySelector('.final_grade');

  // If the final grade element does not exist, return
  if (!finalGradeElement) {
    devLog('Could not find final grade element.');
    return;
  }

  // Get inaccuracies
  const inaccuracies = getInaccuracies(assignments, weightGroups);

  // If there are no inaccuracies, return
  if (inaccuracies.length <= 0) {
    return;
  }

  // Create the inaccuracies element
  const inaccuraciesElement = document.createElement('div');
  const inaccuraciesTitle = document.createElement('span');

  // Populate and style the inaccuracies element
  inaccuraciesTitle.innerText = 'Class Average Inaccuracies: ';
  inaccuraciesTitle.style.fontWeight = 'bold';

  // Create and style the inaccuracies list
  const inaccuraciesList = document.createElement('ul');
  inaccuraciesList.style.fontStyle = 'italic';

  // Add each inaccuracy to the inaccuracies list
  inaccuracies.forEach(inaccuracy => {
    const inaccuracyElement = document.createElement('li');
    inaccuracyElement.innerText = inaccuracy;
    inaccuraciesList.appendChild(inaccuracyElement);
  });

  // Add the inaccuracies title and list to the inaccuracies element
  inaccuraciesElement.appendChild(inaccuraciesTitle);
  inaccuraciesElement.appendChild(inaccuraciesList);

  // Add the inaccuracies element to the final grade element
  finalGradeElement.appendChild(inaccuraciesElement);

}