import { type Student, type Course, type Enrollment } from "../libs/types.ts";

export const students: Student[] = [
  {
    studentId: "680610001",
    firstName: "Matt",
    lastName: "Damon",
    program: "CPE",
    programId: 101,
  },
  {
    studentId: "680610002",
    firstName: "Cillian",
    lastName: "Murphy",
    program: "CPE",
    programId: 101,
    courses: [261207, 261497],
  },
  {
    studentId: "680615003",
    firstName: "Emily",
    lastName: "Blunt",
    program: "ISNE",
    programId: 102,
    courses: [269101, 261497],
  },
];

export const courses: Course[] = [
  {
    courseId: 261207,
    courseTitle: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    courseId: 261497,
    courseTitle: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    courseId: 269101,
    courseTitle: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];

export const enrollments: Enrollment[] = [
  {
    studentId: "680610002",
    courseId: 261207,
  },
  {
    studentId: "680610002",
    courseId: 261497,
  },
  {
    studentId: "680615003",
    courseId: 269101,
  },
  {
    studentId: "680615003",
    courseId: 261497,
  },
];

export const DB = {
  students,
  courses,
  enrollments,
};
