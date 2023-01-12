import { devLog } from "./devLog";
import { getSettings, setSetting, setSettings, toggleSetting } from "./storage";
import { Settings } from "./types";

const defaultSettings: Settings = {
  'gradeChange': {
    value: true,
    name: 'Show Grade Change',
    description: 'Show how your grade has changed from your previous grade.'
  },
  'inaccuracies': {
    value: true,
    name: 'Show Inaccuracies',
    description: 'List specific reasons why the average grade may be inaccurate.'
  },
  'gradeHistory': {
    value: true,
    name: 'Show Grade History',
    description: 'Show a button to toggle a list of your previous grades.'
  },
  'averageComparison': {
    value: true,
    name: 'Show Average Comparison',
    description: 'Show how your grade compares to the class average.'
  },
  'scoreByWeightGroup': {
    value: true,
    name: 'Show Score by Weight Group',
    description: 'Show your grade for each weight group.'
  },
  'averageByWeightGroup': {
    value: true,
    name: 'Show Average by Weight Group',
    description: 'Show the average grade for each weight group.'
  },
  'devMode': {
    value: false,
    name: 'Developer Mode',
    description: 'Shows additional information for development purposes.'
  }
};

export async function configureSettings(): Promise<void> {

  // Get settings from local storage
  const settings: Settings = await getSettings();

  // If settings page has never been loaded, set default settings
  if (!settings) {
    await setSettings(defaultSettings);
    devLog('Settings have never been loaded. Setting default settings.', 'warn');
    return;
  }

  // If saved settings are missing, add them
  for (const setting in defaultSettings) {
    if (!settings[setting]) {
      settings[setting] = defaultSettings[setting];

      // Save the settings
      await setSetting(setting, settings[setting]);

      devLog(`Added setting ${setting}.`, 'warn');
    }
  }

  return;
}

// Display settings page
export async function displaySettings() {

  const settingsContent = document.getElementById('content');
  const settings = await getSettings();

  // If the settings content does not exist, return
  if (!settingsContent) {
    devLog('Settings content does not exist.', 'err');
    return;
  }

  // Create settings section
  const settingsSection = document.createElement('div');

  // Create settings title
  const settingsTitle = document.createElement('h2');
  settingsTitle.innerText = 'Class Average';

  // Create list of checkboxes for each setting
  const settingsList = document.createElement('ul');
  Object.keys(settings).forEach(setting => {
    const settingItem = document.createElement('li');
    const settingCheckbox = document.createElement('input');
    const settingLabel = document.createElement('label');

    // Set checkbox attributes
    settingCheckbox.type = 'checkbox';
    settingCheckbox.id = setting;
    settingCheckbox.checked = settings[setting].value;

    // Add event listener to checkbox
    settingCheckbox.addEventListener('change', () => {
      toggleSetting(setting);
    });

    // Set label attributes
    settingLabel.htmlFor = setting;
    settingLabel.innerText = settings[setting].name;

    // Add checkbox and label to list item
    settingItem.appendChild(settingCheckbox);
    settingItem.appendChild(settingLabel);

    // Add description to list item
    const settingDescription = document.createElement('ul');
    const settingDescriptionItem = document.createElement('li');
    settingDescriptionItem.innerText = settings[setting].description;
    settingDescription.appendChild(settingDescriptionItem);
    settingItem.appendChild(settingDescription);

    // Add list item to list
    settingsList.appendChild(settingItem);
  });

  // Add title and list to settings section
  settingsSection.appendChild(settingsTitle);
  settingsSection.appendChild(settingsList);

  // Add disclaimer to settings section
  const settingsDisclaimer = document.createElement('p');
  settingsDisclaimer.innerText = 'Settings in this section are saved to your browser\'s local storage. If you clear your browser\'s local storage, your settings will be reset. In addition, if you use a different browser or device, your settings will not be saved.\n\nThis section of settings is added by the ';
  const settingsDisclaimerLink = document.createElement('a');
  settingsDisclaimerLink.href = 'https://s.stoiber.network/cca';
  settingsDisclaimerLink.innerText = 'Canvas Class Average extension';
  settingsDisclaimerLink.target = '_blank';
  settingsDisclaimer.appendChild(settingsDisclaimerLink);
  settingsDisclaimer.style.fontStyle = 'italic';
  settingsSection.appendChild(settingsDisclaimer);

  // Add settings section to settings content
  settingsContent.appendChild(settingsSection);
}