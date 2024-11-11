import { devLog } from './devLog';

// Get user's course score
export function getUserScore(): number {
  const score =
    parseFloat(
      document
        .querySelector('.final_grade .grade')
        ?.textContent?.split('%')[0]
        .trim() || '0'
    ) / 100;

  devLog(`Got user score: ${score}`);

  return score;
}
