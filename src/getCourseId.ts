import { devLog } from './devLog';

// Get the course ID for the current grade page
export function getCourseId(): number {
  // Get the course ID from the URL
  const courseId = parseInt(window.location.pathname.split('/')[2]);

  devLog(`Got Course ID: ${courseId}`);
  return courseId;
}
