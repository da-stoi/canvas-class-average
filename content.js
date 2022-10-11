const gradesSummary = document.getElementById('grades_summary').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

// Get the weights of the assignment groups
function getWeights() {
  const weights = {
    'total': 1,
  };

  // Get the assignment groups weight table
  const weightTbody = document.querySelector('#assignments-not-weighted .summary tbody');

  // If there is no weight table, return the default weights
  if (!weightTbody) {
    return weights;
  }

  // Parse the weight rows into a JSON object
  const weightRows = weightTbody.getElementsByTagName('tr');
  for (let i = 0; i < weightRows.length; i++) {
    const weight = weightRows[i];

    const group = weight.querySelector('th').innerText.trim().toLowerCase();
    const weightText = weight.querySelector('td').innerText.trim();
    const weightValue = parseFloat(weightText.split('%')[0]) / 100;

    weights[group] = weightValue;
  }

  return weights;
}

// Get the assignments from the grades summary
function getAssignments() {
  let assignments = [];

  for (let i = 0; i < gradesSummary.length; i++) {

    const gradeSummary = gradesSummary[i];
    const assignmentIdText = gradeSummary.id;

    // Only process unique assignments
    if (assignmentIdText.includes('submission') && !assignmentIdText.includes('group') && !assignmentIdText.includes('final')) {

      // Parse the assignment id
      const assignmentId = parseInt(assignmentIdText.split('_')[1]);

      // Check if the assignment counts towards the final grade
      const assignmentCount = document.getElementById(`final_grade_info_${assignmentId}`).innerText.includes('does not count toward the final grade');

      // Get the assignment average
      const scoreDetails = document.getElementById(`score_details_${assignmentId}`);
      let average = null;
      if (scoreDetails) {
        const averageText = scoreDetails.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].innerText.trim().split('\n')[1].trim();
        average = parseFloat(averageText);
      }

      // Get the assignment name
      const name = gradeSummary.querySelector('.title a').innerText.trim();

      // Get the assignment possible
      const possible = parseFloat(gradeSummary.querySelector('.possible').innerText.trim())

      // Get assignment grade
      const gradeSplitText = gradeSummary.querySelector('.grade').innerText.trim().split('\n');
      const gradeText = gradeSplitText[gradeSplitText.length - 1].trim()

      // Get if the assignment is dropped
      const dropped = gradeSummary.classList.contains('dropped');

      // Get assignment group
      const group = gradeSummary.querySelector('.title .context').innerText.trim().toLowerCase();

      // Only add the assignment if it has a grade
      if (!gradeText.toLowerCase().includes('instructor')) {
        const score = gradeText.includes('-') ? 0 : parseFloat(gradeText);

        const assignment = {
          id: assignmentId,
          name,
          score,
          possible,
          average,
          group,
          dropped,
          countsTowardsFinalGrade: !assignmentCount
        };

        assignments.push(assignment);
      }
    }
  }

  return assignments;
}

// Get the current class average
function getClassAverage(assignments) {

  // Get assignment weights
  let weights = getWeights();

  let groupScores = {};

  // For each assignment, calculate the weighted score
  assignments.forEach(assignment => {
    if (assignment.countsTowardsFinalGrade && assignment.average) {

      // Get the weight of the assignment
      const weight = weights[assignment.group] || weights['total'];

      // Add the assignment to the group scores
      if (groupScores[assignment.group]) {
        groupScores[assignment.group].score += assignment.average * weight;
        groupScores[assignment.group].possible += assignment.possible * weight;
      } else {
        groupScores[assignment.group] = {
          score: assignment.average * weight,
          possible: assignment.possible * weight
        }
      }
    }
  });

  let totalScore = 0;
  let totalPossible = 0;

  // Calculate the total score
  for (const group in groupScores) {
    totalScore += groupScores[group].score;
    totalPossible += groupScores[group].possible;
  }

  // Calculate the average
  const average = totalScore / totalPossible;

  return average;
}

// Display the average
function displayAverage(average) {

  // Get course id
  const courseId = window.location.pathname.split('/')[2];

  // Get total grade
  const total = parseInt(document.querySelector('.final_grade .grade').innerText.split('%')[0].trim()) / 100;

  // Get the percentage of the average
  const percent = (average * 100).toFixed(2);

  // Make the class average title element
  const finalGradeChild = document.getElementById('student-grades-right-content').querySelector('.final_grade');
  const classAverageChild = document.createElement('div');
  classAverageChild.innerText = `Class Average: `;

  // Check if the average has changed
  const previousAverage = averageChanged(average, total, courseId);

  // Create the class average percent element
  const percentSpan = document.createElement('span');

  if (previousAverage && average !== previousAverage) {
    const percentDifference = Math.abs(((average - previousAverage) * 100).toFixed(2));
    percentSpan.innerHTML = `${percent}% <span style="color: ${previousAverage > average ? 'var(--dUOHu-errorColor)' : 'var(--dUOHu-successColor)'};">(${previousAverage > average ? '-' : '+'}${percentDifference}%)</span>`;
  } else {
    percentSpan.innerText = `${percent}%`;
  }

  // Add the percent span to the DOM
  percentSpan.classList.add('grade');
  classAverageChild.appendChild(percentSpan);

  // Add the class average to the DOM
  finalGradeChild.after(classAverageChild);

  // Add show class average history button
  const showHistoryButton = document.createElement('button');
  showHistoryButton.innerText = 'Show Grade History';
  showHistoryButton.classList.add('Button');

  // Make average history table
  let gradeHistory = JSON.parse(localStorage.getItem(`average-${courseId}`)) || [];

  // Add table headers
  const gradeHistoryTable = document.createElement('table');
  gradeHistoryTable.classList.add('table');
  const gradeHistoryTableHead = document.createElement('thead');
  const gradeHistoryTableHeadRow = document.createElement('tr');
  const gradeHistoryTableHeadRowDate = document.createElement('th');
  gradeHistoryTableHeadRowDate.innerText = 'Date';
  const gradeHistoryTableHeadRowTotal = document.createElement('th');
  gradeHistoryTableHeadRowTotal.innerText = 'Total';
  const gradeHistoryTableHeadRowAverage = document.createElement('th');
  gradeHistoryTableHeadRowAverage.innerText = 'Average';
  gradeHistoryTableHeadRow.appendChild(gradeHistoryTableHeadRowDate);
  gradeHistoryTableHeadRow.appendChild(gradeHistoryTableHeadRowTotal);
  gradeHistoryTableHeadRow.appendChild(gradeHistoryTableHeadRowAverage);
  gradeHistoryTableHead.appendChild(gradeHistoryTableHeadRow);
  gradeHistoryTable.appendChild(gradeHistoryTableHead);

  // Add table body
  const gradeHistoryTableBody = document.createElement('tbody');

  // Reverse the average history so the most recent is at the top
  gradeHistory.reverse();

  // Remove the first element
  gradeHistory.shift();

  // Trim list to 10
  gradeHistory = gradeHistory.slice(0, 10);

  // Add the average history to the table
  gradeHistory.forEach((average, i) => {

    // If the average has a previous average, calculate the difference
    let hasPreviousAverage = false;

    if (gradeHistory[i + 1]) {
      hasPreviousAverage = true;
    }
    const totalDifferenceSpan = document.createElement('span');
    const averageDifferenceSpan = document.createElement('span');

    if (hasPreviousAverage) {
      // Get total percentage difference
      const totalDifference = Math.abs(((gradeHistory[i + 1].total - average.total) * 100).toFixed(2));
      totalDifferenceSpan.innerText = `${gradeHistory[i + 1].total < average.total ? '+' : '-'}${totalDifference}%`;
      totalDifferenceSpan.style.color = gradeHistory[i + 1].total < average.total ? 'var(--dUOHu-successColor)' : 'var(--dUOHu-errorColor)';

      // Get average percentage difference
      const averageDifference = Math.abs(((gradeHistory[i + 1].average - average.average) * 100).toFixed(2));
      averageDifferenceSpan.innerText = `${gradeHistory[i + 1].average < average.average ? '+' : '-'}${averageDifference}%`;
      averageDifferenceSpan.style.color = gradeHistory[i + 1].average < average.average ? 'var(--dUOHu-successColor)' : 'var(--dUOHu-errorColor)';
    }

    // Populate table row
    const gradeHistoryTableBodyRow = document.createElement('tr');
    const gradeHistoryTableBodyRowDate = document.createElement('td');
    gradeHistoryTableBodyRowDate.innerText = new Date(average.date).toLocaleString();
    const gradeHistoryTableBodyRowTotal = document.createElement('td');
    gradeHistoryTableBodyRowTotal.innerText = `${(average.total * 100).toFixed(2)}%\n`;
    const gradeHistoryTableBodyRowAverage = document.createElement('td');
    gradeHistoryTableBodyRowAverage.innerText = `${(average.average * 100).toFixed(2)}%\n`;
    if (hasPreviousAverage) {
      gradeHistoryTableBodyRowTotal.appendChild(totalDifferenceSpan);
      gradeHistoryTableBodyRowAverage.appendChild(averageDifferenceSpan);
    }
    gradeHistoryTableBodyRow.appendChild(gradeHistoryTableBodyRowDate);
    gradeHistoryTableBodyRow.appendChild(gradeHistoryTableBodyRowTotal);
    gradeHistoryTableBodyRow.appendChild(gradeHistoryTableBodyRowAverage);
    gradeHistoryTableBody.appendChild(gradeHistoryTableBodyRow);
  });

  gradeHistoryTable.style.display = 'none';
  gradeHistoryTable.appendChild(gradeHistoryTableBody);

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


  // Add the button to the DOM
  classAverageChild.after(showHistoryButton);
  showHistoryButton.before(document.createElement('br'));

  // Add the average history table to the DOM
  showHistoryButton.after(gradeHistoryTable);

  // Show total percent change
  const previousTotal = gradeHistory[0]?.total;

  // Add the total percent change to the DOM if there is a previous total
  if (previousTotal && total !== previousTotal) {
    const percentDifference = Math.abs(((total - previousTotal) * 100).toFixed(2));
    const totalElement = document.getElementById('student-grades-right-content').querySelector('.final_grade .grade');
    totalElement.innerHTML += ` <span style="color: ${previousTotal > total ? 'var(--dUOHu-errorColor)' : 'var(--dUOHu-successColor)'};">(${previousTotal > total ? '-' : '+'}${percentDifference}%)</span>`;
  }

  return;
}

// Check if the average has changed from the last time it was checked
function averageChanged(average, total, courseId) {

  let gradeHistory = JSON.parse(localStorage.getItem(`average-${courseId}`)) || [];

  // If the average has never been logged, log it and return false
  if (gradeHistory.length === 0) {

    gradeHistory.push({
      date: new Date(),
      total,
      average
    });

    window.localStorage.setItem(`average-${courseId}`, JSON.stringify(gradeHistory));

    return false;
  }

  let previousAverage = gradeHistory[gradeHistory.length - 1].average;

  // If the average has changed, log it and return true
  if (previousAverage !== average) {

    gradeHistory.push({
      date: new Date(),
      total,
      average
    });

    window.localStorage.setItem(`average-${courseId}`, JSON.stringify(gradeHistory));

  } else {
    if (gradeHistory.length > 1) {
      previousAverage = gradeHistory[gradeHistory.length - 2].average;
    }
  }

  return previousAverage;
}

// Wait for the dropped assignment classes to be added
setTimeout(() => {
  // Calculate and display the class average
  const assignments = getAssignments();
  console.log("All assignments: ", assignments);
  console.log("Weight Table: ", getWeights());
  const average = getClassAverage(assignments);
  displayAverage(average);
}, 500);
