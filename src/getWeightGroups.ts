import { WeightGroups } from "./types";

// Get weight groups from the weight table
export function getWeightGroups(): WeightGroups {

  const weightGroups: WeightGroups = {
    'total': 1,
  };

  // Get the assignment groups weight table
  const weightTable = document.querySelector('#assignments-not-weighted .summary tbody');

  // If there is no weight table, return the default weightGroups
  if (!weightTable) {
    return weightGroups;
  }

  // Parse the weight rows into a JSON object
  const weightRows = Array.from(weightTable.getElementsByTagName('tr'));
  weightRows.forEach(row => {

    const group: string = row.querySelector('th')?.innerText.trim().toLowerCase() || '';
    const weight: number = parseFloat(row.querySelector('td')?.innerText.trim().split('%')[0] || '0') / 100;

    if (group === '' && weight === 0) {
      return;
    }

    weightGroups[group] = weight;
  });

  return weightGroups;
}