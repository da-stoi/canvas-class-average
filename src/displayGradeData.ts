import { devLog } from './devLog';
import { getGradesByWeightGroup } from './getGradesByWeightGroup';
import { getUserScore } from './getUserScore';
import { onlyGradedAssignments } from './onlyGradedAssignmentsToggle';
import { getSetting } from './storage';
import { Assignment, GradeHistory, WeightGroups } from './types';

// Create the grade change percentage element
function gradeChangeSpan(previousScore: number, currentScore: number): string {
  const span = document.createElement('span');

  const currentPercent: number = parseFloat((currentScore * 100).toFixed(2));

  if (previousScore !== currentScore) {
    const percentDifference = parseFloat(
      (Math.abs(currentScore - previousScore) * 100).toFixed(2)
    );
    span.innerHTML = `${currentPercent}% <span style="color: ${
      previousScore > currentScore
        ? 'var(--dUOHu-errorColor)'
        : 'var(--dUOHu-successColor)'
    };">(${
      previousScore > currentScore ? '-' : '+'
    }${percentDifference}%)</span>`;
  } else {
    span.innerText = `${currentPercent}%`;
  }

  return span.innerHTML;
}

// Display the average under the user's total score
export async function displayAverage(
  average: number | boolean,
  userScore: number,
  gradeHistory: GradeHistory[]
) {
  const finalGradeElement = document
    .getElementById('student-grades-right-content')
    ?.querySelector('.final_grade');
  const classAverageElement = document.createElement('div');
  classAverageElement.id = 'cca-class-average';
  classAverageElement.innerText = `Class Average: `;

  // If there is no final grade element, return
  if (!finalGradeElement) {
    devLog('No final grade element found', 'err');
    return;
  }

  // If the average is false, display N/A
  if (average === false) {
    // Set the class average element to N/A
    classAverageElement.innerText += 'N/A';
    const naReason = document.createElement('span');

    // Add reason why the average is N/A
    naReason.innerText = ' (Averages not published)';
    naReason.style.fontStyle = 'italic';
    classAverageElement.appendChild(naReason);

    // Update DOM
    finalGradeElement.appendChild(classAverageElement);
    return;
  }

  // This should never happen, but to please TypeScript, return
  if (average === true) {
    return;
  }

  // Sort grade history by date
  const sortedGradeHistory = gradeHistory.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get the previous average, or set it to the current average if there is no previous average
  const previousAverage: number =
    sortedGradeHistory.length <= 1 ? average : sortedGradeHistory[1].average;

  // Create the class average percent element
  let averagePercentSpan: string = gradeChangeSpan(previousAverage, average);

  // If enabled, display how the user's score compares to the class average
  if (await getSetting('averageComparison')) {
    if (average > userScore) {
      const averageDifference = (Math.abs(average - userScore) * 100).toFixed(
        2
      );
      averagePercentSpan += `<span style="font-style: italic;"> (You are ${averageDifference}% behind the class average)</span>`;
    } else if (average < userScore) {
      const averageDifference = (Math.abs(userScore - average) * 100).toFixed(
        2
      );
      averagePercentSpan += `<span style="font-style: italic;"> (You are ${averageDifference}% ahead of the class average)</span>`;
    }
  }

  // Add the average percent element to the class average element
  classAverageElement.innerHTML += averagePercentSpan;

  // Add the class average element to the final grade element
  finalGradeElement.appendChild(classAverageElement);

  // Add a break element to the final grade element
  finalGradeElement.appendChild(document.createElement('br'));
}

// Update the average under the user's total score
export async function updateAverageDisplay(
  average: number,
  userScore: number,
  gradeHistory: GradeHistory[]
) {
  const classAverageElement = document.getElementById('cca-class-average');

  // If there is no final grade element, return
  if (!classAverageElement) {
    devLog('No class average element found', 'err');
    return;
  }

  // Sort grade history by date
  const sortedGradeHistory = gradeHistory.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get the previous average, or set it to the current average if there is no previous average
  const previousAverage: number =
    sortedGradeHistory.length <= 1 ? average : sortedGradeHistory[0].average;

  // Create the class average percent element
  let averagePercentSpan: string = gradeChangeSpan(previousAverage, average);

  // If enabled, display how the user's score compares to the class average
  if (await getSetting('averageComparison')) {
    if (average > userScore) {
      const averageDifference = (Math.abs(average - userScore) * 100).toFixed(
        2
      );
      averagePercentSpan += `<span style="font-style: italic;"> (You are ${averageDifference}% behind the class average)</span>`;
    } else if (average < userScore) {
      const averageDifference = (Math.abs(userScore - average) * 100).toFixed(
        2
      );
      averagePercentSpan += `<span style="font-style: italic;"> (You are ${averageDifference}% ahead of the class average)</span>`;
    }
  }

  // Add the average percent element to the class average element
  classAverageElement.innerHTML = `Class Average: ${averagePercentSpan}`;
}

// Display user's grade change
export function displayGradeChange(gradeHistory: GradeHistory[]) {
  const finalGradeElement = document
    .getElementById('student-grades-right-content')
    ?.querySelector('.final_grade');

  // If there is no grade history or the final grade element does not exist, return
  if (gradeHistory.length <= 1 || !finalGradeElement) {
    devLog('No grade history or no final grade element found', 'err');
    return;
  }

  // Sort grade history by date
  const sortedGradeHistory = gradeHistory.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get the previous user score
  const previousScore: number = sortedGradeHistory[1].total;

  // Create the new total percent element
  const totalPercentSpan: string = gradeChangeSpan(
    previousScore,
    getUserScore()
  );

  // Add the total percent element to the class average element
  if (finalGradeElement.getElementsByClassName('grade')[0]) {
    finalGradeElement.getElementsByClassName('grade')[0].innerHTML =
      totalPercentSpan;
  }
}

// Grade history button
function hideShowGradeHistoryButton(gradeHistoryTable: HTMLTableElement) {
  // Add "Hide/Show Class Average History" button
  const showHistoryButton = document.createElement('button');
  showHistoryButton.innerText = 'Show Grade History';
  showHistoryButton.classList.add('Button');

  // Add click event to toggle class average history
  showHistoryButton.addEventListener('click', () => {
    const isShowing = showHistoryButton.getAttribute('data-showing') === 'true';

    if (isShowing) {
      showHistoryButton.setAttribute('data-showing', 'false');
      showHistoryButton.innerText = 'Show Grade History';
    } else {
      showHistoryButton.setAttribute('data-showing', 'true');
      showHistoryButton.innerText = 'Hide Grade History';
    }

    gradeHistoryTable.style.display = isShowing ? 'none' : 'block';
  });

  // return the button
  return showHistoryButton;
}

// Grade history row
function gradeHistoryRow(
  gradeHistory: GradeHistory,
  previousGradeHistory: GradeHistory | null
) {
  const totalDifferenceSpan = document.createElement('span');
  const averageDifferenceSpan = document.createElement('span');

  if (previousGradeHistory) {
    // Only show if there is a difference
    if (previousGradeHistory.total !== gradeHistory.total) {
      // Get total percentage difference
      const totalDifference = (
        Math.abs(previousGradeHistory.total - gradeHistory.total) * 100
      ).toFixed(2);
      totalDifferenceSpan.innerText = `${
        previousGradeHistory.total < gradeHistory.total ? '+' : '-'
      }${totalDifference}%`;
      totalDifferenceSpan.style.color =
        previousGradeHistory.total < gradeHistory.total
          ? 'var(--dUOHu-successColor)'
          : 'var(--dUOHu-errorColor)';
    }

    // Only show if there is a difference
    if (previousGradeHistory.average !== gradeHistory.average) {
      // Get average percentage difference
      const averageDifference = (
        Math.abs(previousGradeHistory.average - gradeHistory.average) * 100
      ).toFixed(2);
      averageDifferenceSpan.innerText = `${
        previousGradeHistory.average < gradeHistory.average ? '+' : '-'
      }${averageDifference}%`;
      averageDifferenceSpan.style.color =
        previousGradeHistory.average < gradeHistory.average
          ? 'var(--dUOHu-successColor)'
          : 'var(--dUOHu-errorColor)';
    }
  }

  // Populate table row
  const gradeHistoryTableBodyRow = document.createElement('tr');
  const gradeHistoryTableBodyRowDate = document.createElement('td');
  gradeHistoryTableBodyRowDate.innerText = new Date(
    gradeHistory.date
  ).toLocaleString();
  const gradeHistoryTableBodyRowTotal = document.createElement('td');
  gradeHistoryTableBodyRowTotal.innerText = `${(
    gradeHistory.total * 100
  ).toFixed(2)}%\n`;
  const gradeHistoryTableBodyRowAverage = document.createElement('td');
  gradeHistoryTableBodyRowAverage.innerText = `${(
    gradeHistory.average * 100
  ).toFixed(2)}%\n`;
  if (previousGradeHistory) {
    gradeHistoryTableBodyRowTotal.appendChild(totalDifferenceSpan);
    gradeHistoryTableBodyRowAverage.appendChild(averageDifferenceSpan);
  }
  gradeHistoryTableBodyRow.appendChild(gradeHistoryTableBodyRowDate);
  gradeHistoryTableBodyRow.appendChild(gradeHistoryTableBodyRowTotal);
  gradeHistoryTableBodyRow.appendChild(gradeHistoryTableBodyRowAverage);

  return gradeHistoryTableBodyRow;
}

// Display grade history
export function displayGradeHistory(gradeHistory: GradeHistory[]) {
  // Add table headers
  const gradeHistoryTable: HTMLTableElement = document.createElement('table');
  // Hide the table by default
  gradeHistoryTable.style.display = 'none';
  // Add Canvas table class
  gradeHistoryTable.classList.add('table');
  // Create table headers
  const gradeHistoryTableHead = document.createElement('thead');
  const gradeHistoryTableHeadRow = document.createElement('tr');
  const gradeHistoryTableHeadRowDate = document.createElement('th');
  const gradeHistoryTableHeadRowTotal = document.createElement('th');
  const gradeHistoryTableHeadRowAverage = document.createElement('th');
  // Populate table headers
  gradeHistoryTableHeadRowDate.innerText = 'Date';
  gradeHistoryTableHeadRowTotal.innerText = 'Total';
  gradeHistoryTableHeadRowAverage.innerText = 'Average';
  // Append table headers
  gradeHistoryTableHeadRow.appendChild(gradeHistoryTableHeadRowDate);
  gradeHistoryTableHeadRow.appendChild(gradeHistoryTableHeadRowTotal);
  gradeHistoryTableHeadRow.appendChild(gradeHistoryTableHeadRowAverage);
  gradeHistoryTableHead.appendChild(gradeHistoryTableHeadRow);
  gradeHistoryTable.appendChild(gradeHistoryTableHead);

  // Add table body
  const gradeHistoryTableBody = document.createElement('tbody');

  // Sort grade history by date
  let sortedGradeHistory = gradeHistory.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Remove the first element
  sortedGradeHistory.shift();
  // Trim list to 10
  sortedGradeHistory = sortedGradeHistory.slice(0, 10);

  // Add table rows
  sortedGradeHistory.forEach((gradeHistoryItem, index) => {
    const previousGradeHistory = sortedGradeHistory[index + 1];
    gradeHistoryTableBody.appendChild(
      gradeHistoryRow(gradeHistoryItem, previousGradeHistory)
    );
  });

  // Append table body
  gradeHistoryTable.appendChild(gradeHistoryTableBody);

  const hideShowHistoryButton = hideShowGradeHistoryButton(gradeHistoryTable);

  // Add the button to the DOM
  const finalGradeElement = document
    .getElementById('student-grades-right-content')
    ?.querySelector('.final_grade');
  if (!finalGradeElement) {
    devLog('Could not find final grade element', 'err');
    return;
  }
  finalGradeElement.after(hideShowHistoryButton);
  hideShowHistoryButton.before(document.createElement('br'));

  // Add the average history table to the DOM
  hideShowHistoryButton.after(gradeHistoryTable);
}

// Display average by weight group
export function displayAverageByWeightGroup(
  assignments: Assignment[],
  weightGroups: WeightGroups,
  average: number
) {
  // Get average by weight group
  const averageByWeightGroup = getGradesByWeightGroup(
    assignments,
    weightGroups
  );

  // Get the weight group table
  const weightTable = document.querySelector(
    '#assignments-not-weighted .summary'
  );
  const weightTableHeader = weightTable?.querySelector('thead tr');
  const weightTableBody = weightTable?.querySelector('tbody');

  // If the weight table doesn't exist, return
  if (!weightTable || !weightTableBody || !weightTableHeader) {
    devLog('Could not find weight table', 'err');
    return;
  }

  // Add the average column header to the weight table
  const averageColumnHeader = document.createElement('th');
  averageColumnHeader.innerText = 'Average';
  weightTableHeader.appendChild(averageColumnHeader);

  // Get the weight table rows
  const weightRows = Array.from(weightTableBody.getElementsByTagName('tr'));

  // Loop through the weight groups
  weightRows.forEach((weightRow) => {
    // Get the weight group name
    const weightGroupName = weightRow
      .querySelector('th')
      ?.innerText.trim()
      .toLowerCase();

    // If the weight group name doesn't exist, return
    if (!weightGroupName) {
      devLog('Could not find weight group name', 'err');
      return;
    }

    // Get the weight group average
    const weightGroupAverage = averageByWeightGroup[weightGroupName];

    const averageCell = document.createElement('td');

    // If the weight group average doesn't exist, return
    if (!weightGroupAverage && weightGroupName !== 'total') {
      averageCell.innerText = '-';
      averageCell.classList.add('cca-no-score');
    } else if (weightGroupName === 'total') {
      // Populate the average cell with average
      averageCell.innerText = `${(average * 100).toFixed(1)}%`;
      averageCell.id = 'cca-weight-table-total-average';
    } else {
      // Populate the average cell with average
      averageCell.innerText = `${(
        (weightGroupAverage.average / weightGroupAverage.possible) *
        100
      ).toFixed(1)}%`;
    }

    // Add the average cell to the weight group row
    weightRow.appendChild(averageCell);
  });
}

// Update average by weight group
export function updateAverageAndScoreByWeightGroup(
  average: number,
  userScore: number
) {
  const averageCell = document.getElementById('cca-weight-table-total-average');
  const scoreCell = document.getElementById('cca-weight-table-total-score');
  const noScoreCells = Array.from(
    document.getElementsByClassName('cca-no-score')
  );

  // Update the average cell
  if (averageCell) {
    averageCell.innerText = `${(average * 100).toFixed(1)}%`;
  }

  // Update the users score cell
  if (scoreCell) {
    scoreCell.innerText = `${(userScore * 100).toFixed(1)}%`;
  }

  // Update the no score cells
  if (noScoreCells.length > 0) {
    noScoreCells.forEach((noScoreCell) => {
      noScoreCell.textContent = onlyGradedAssignments() ? '-' : '0%';
    });
  }
}

// Display user's score by weight group
export function displayScoreByWeightGroup(
  assignments: Assignment[],
  weightGroups: WeightGroups,
  userScore: number
) {
  // Get score by weight group
  const scoreByWeightGroup = getGradesByWeightGroup(assignments, weightGroups);

  // Get the weight group table
  const weightTable = document.querySelector(
    '#assignments-not-weighted .summary'
  );
  const weightTableHeader = weightTable?.querySelector('thead tr');
  const weightTableBody = weightTable?.querySelector('tbody');

  // If the weight table doesn't exist, return
  if (!weightTable || !weightTableBody || !weightTableHeader) {
    devLog('Could not find weight table', 'err');
    return;
  }

  // Add the score column header to the weight table
  const scoreColumnHeader = document.createElement('th');
  scoreColumnHeader.innerText = 'Score';
  weightTableHeader.appendChild(scoreColumnHeader);

  // Get the weight table rows
  const weightRows = Array.from(weightTableBody.getElementsByTagName('tr'));

  // Loop through the weight groups
  weightRows.forEach((weightRow) => {
    // Get the weight group name
    const weightGroupName = weightRow
      .querySelector('th')
      ?.innerText.trim()
      .toLowerCase();

    // If the weight group name doesn't exist, return
    if (!weightGroupName) {
      devLog('Could not find weight group name', 'err');
      return;
    }

    // Get the weight group score
    const weightGroupScore = scoreByWeightGroup[weightGroupName];

    const scoreCell = document.createElement('td');

    // If the weight group score doesn't exist, return
    if (!weightGroupScore && weightGroupName !== 'total') {
      scoreCell.innerText = '-';
      scoreCell.classList.add('cca-no-score');
    } else if (weightGroupName === 'total') {
      // Populate the score cell with score
      scoreCell.innerText = `${(userScore * 100).toFixed(1)}%`;
      scoreCell.id = 'cca-weight-table-total-score';
    } else {
      // Populate the score cell with score
      scoreCell.innerText = `${(
        (weightGroupScore.score / weightGroupScore.possible) *
        100
      ).toFixed(1)}%`;
    }

    // Add the score cell to the weight group row
    weightRow.appendChild(scoreCell);
  });
}
