const gradesSummary = document.getElementById('grades_summary').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

function getWeights() {
  const weights = {
    'total': 1,
  };

  const weightTbody = document.querySelector('#assignments-not-weighted .summary tbody');

  if (!weightTbody) {
    return weights;
  }

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

function getClassAverage(assignments) {

  // Get assignment weights
  let weights = getWeights();

  let groupScores = {};

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

function displayAverage(average) {

  // Get the percentage of the average
  const percent = (average * 100).toFixed(2);

  const finalGradeChild = document.getElementById('student-grades-right-content').querySelector('.final_grade');
  const classAverageChild = document.createElement('div');
  classAverageChild.innerText = `Class Average: `;

  // Create the class average percent element
  const percentSpan = document.createElement('span');
  percentSpan.innerText = `${percent}%`;
  percentSpan.classList.add('grade');
  classAverageChild.appendChild(percentSpan);

  // Add the class average to the DOM
  finalGradeChild.after(classAverageChild);
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
