import { getSettings } from "./settings";

export function devLog(text: string, logType: 'err' | 'warn' | null = null,) {

  // If devMode is enabled, log the arguments
  if (getSettings('devMode')?.value) {
    console.log(`%cCanvas Class Average\x1b[0m [${logType === 'err' ? '\x1b[31mError' : logType === 'warn' ? '\x1b[33mWarning' : 'Log'}\x1b[0m] ${text}`, 'color: #222;background-color: #fff;padding: 2px 4px;border-radius: 2px;');
  }
}