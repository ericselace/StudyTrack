const COURSES_KEY = "studytrack-courses";

export function getCourses() {
  const courses = localStorage.getItem(COURSES_KEY);
  return courses ? JSON.parse(courses) : [];
}

export function saveCourses(courses) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}
const ASSIGNMENTS_KEY = "studytrack-assignments";

export function getAssignments() {
  const assignments = localStorage.getItem(ASSIGNMENTS_KEY);

  return assignments ? JSON.parse(assignments) : [];
}

export function saveAssignments(assignments) {
  localStorage.setItem(
    ASSIGNMENTS_KEY,
    JSON.stringify(assignments),
  );
}