import { getSetting } from './storage';

// Log to console if devMode is enabled
export async function devLog(
  text: string,
  logType: 'err' | 'warn' | null = null
): Promise<void> {
  const devMode = await getSetting('devMode');

  // If devMode is enabled, log the arguments
  if (devMode) {
    console.log(
      `%cCanvas Class Average\x1b[0m [${
        logType === 'err'
          ? '\x1b[31mError'
          : logType === 'warn'
          ? '\x1b[33mWarning'
          : 'Log'
      }\x1b[0m] ${text}`,
      'color: #222;background-color: #fff;padding: 2px 4px;border-radius: 2px;'
    );
  }
}
