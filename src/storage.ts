import { devLog } from "./devLog";
import { GradeHistory, Settings } from "./types";

// Get grade history for a course
export async function getGradeHistory(course: number): Promise<GradeHistory[]> {

  await updateOldCourseHistoryFormat(course);

  const cca = await chrome.storage.sync.get();

  // If there is no grade history, return an empty array
  if (!cca.gradeHistory) {
    return [];
  }

  const parsedGradeHistory: GradeHistory[] = cca.gradeHistory[course];

  const sortedGradeHistory = parsedGradeHistory.sort((a: GradeHistory, b: GradeHistory) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Return the parsed grade history
  return sortedGradeHistory;
}

// Append grade history for a course
export async function appendGradeHistory(course: number, average: number, total: number): Promise<object> {

  // Create the new grade history object
  const newGradeHistory: GradeHistory = {
    average,
    total,
    date: new Date()
  };

  // Get existing cca data
  const cca = await chrome.storage.sync.get();

  // Check if submitted grade history is the same as the previous grade history
  if (cca.gradeHistory
    && cca.gradeHistory[course]
    && cca.gradeHistory[course].length > 0
    && cca.gradeHistory[course][cca.gradeHistory[course].length - 1].average === newGradeHistory.average
    && cca.gradeHistory[course][cca.gradeHistory[course].length - 1].total === newGradeHistory.total) {

    // Return course history and don't update
    return cca.gradeHistory[course];
  }

  // If there is no grade history or if the course has no history, set the grade history
  if (!cca.gradeHistory || !cca.gradeHistory[course]) {

    // Assemble updated cca data
    let updatedCca = {
      ...cca,
      gradeHistory: {
        ...cca.gradeHistory,
        [course]: [
          newGradeHistory
        ]
      }
    };

    // Set updated cca data
    chrome.storage.sync.set(updatedCca);

    // Return course history
    return updatedCca.gradeHistory[course];
  }

  // If the course has history, append the new grade history
  let updatedCca = {
    ...cca,
    gradeHistory: {
      [course]: [
        ...cca.gradeHistory[course],
        newGradeHistory
      ]
    }
  };

  // Set updated cca data
  chrome.storage.sync.set(updatedCca);

  // Return course history
  return updatedCca.gradeHistory[course];
}

// Set extension settings
export async function setSettings(settings: Settings): Promise<void> {

  // Get existing cca data
  let cca = await chrome.storage.sync.get();

  // Update cca data
  cca.settings = settings;

  // Set updated cca data
  chrome.storage.sync.set(cca);
}

// Set extension setting
export async function setSetting(key: string, setting: object): Promise<void> {

  // Get existing cca data
  let cca = await chrome.storage.sync.get();

  // Update cca data
  cca.settings[key] = setting;

  // Set updated cca data
  chrome.storage.sync.set(cca);
}

// Update extension settings
export async function toggleSetting(setting: string): Promise<boolean> {

  // Get existing cca data
  let cca = await chrome.storage.sync.get();

  const newState = !cca.settings[setting].value;

  // Toggle the setting
  cca.settings[setting].value = newState;

  // Update cca data
  chrome.storage.sync.set(cca);

  // Return updated setting state
  return newState;
}

// Get single setting
export async function getSetting(setting: string): Promise<boolean> {

  // Get existing cca data
  const cca = await chrome.storage.sync.get();

  if (setting !== 'devMode') {
    devLog(`Got setting ${setting}: ${cca.settings[setting].value}`);
  }
  // Return setting value
  return cca.settings[setting].value;
}

// Get all settings
export async function getSettings(): Promise<Settings> {

  // Get existing cca data
  const cca = await chrome.storage.sync.get();

  // Return settings
  return cca.settings;
}

// Update old course history format to new course history format
async function updateOldCourseHistoryFormat(course: number): Promise<void> {

  // Get old grade history from local storage
  let oldCourseHistory = localStorage.getItem(`average-${course}`);

  // If there is no old course history
  if (!oldCourseHistory) {
    return;
  }

  console.log('We just got here', oldCourseHistory);

  // Parse the old course history
  oldCourseHistory = JSON.parse(oldCourseHistory);

  // Create the new course history
  const cca = await chrome.storage.sync.get();

  // Created updated cca object
  let updatedCca = {
    ...cca,
    gradeHistory: {
      ...cca.gradeHistory,
      [course]: oldCourseHistory
    }
  };

  // Set new grade history format
  chrome.storage.sync.set(updatedCca);

  // Remove old course history
  localStorage.removeItem(`average-${course}`);

  // Return grade history
  return;
}