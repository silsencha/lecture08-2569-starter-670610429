// src/routes/studentsRoutes_v2.ts
import { Router, type Request, type Response } from "express";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
  zStudentId,
} from "../libs/studentValidator.js";

import type { Student, Enrollment } from "../libs/types.ts";
import { success } from "zod";
import { tr } from "zod/locales";

// import database
import { readDataFile, writeDataFile } from "../db/db_transactions.ts";
import "../db/db_students.json";

// import endpoint not found middleware
import notFoundMiddleware from "../middlewares/notFoundMiddleware.ts";
import { error } from "node:console";

// create a new router
const router = Router();

// /api/v2/students
router.get("/students", async (req: Request, res: Response) => {
  try {
    // Read data from database (db_students.json)
    const students = await readDataFile();
    const program = req.query.program;

    if (program) {
      let filtered_students = students.filter(
        (student) => student.program === program,
      );
      return res.json({
        ver: "v2",
        success: true,
        data: filtered_students,
      });
    } else {
      return res.json({
        ver: "v2",
        success: true,
        data: students,
      });
    }
  } catch (err) {
    return res.json({
      ver: "v2",
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.get("/students/:studentId", async (req: Request, res: Response) => {
  try {
    // Read data from database (db_student.json)
    const students = await readDataFile();
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);

    // check validation result
    if (!result.success) {
      return res.status(400).json({
        ver: "v2",
        success: false,
        message: "Balidation failed",
        error: result.error.issues[0],
      });
    }

    // check if index match
    for (let index = 0; index < students.length; index++) {
      if (studentId === students[index].studentId) {
        return res.status(200).json({
          ver: "v2",
          success: true,
          message: `Student ${studentId} found.`,
          data: students[index],
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      ver: "v2",
      success: false,
      message: "Internal sever error",
      error: err,
    });
  }
});

router.post("/students", async (req: Request, res: Response) => {
  try {
    // Read file from database
    const students = await readDataFile();

    // read body from request
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        ver: "v2",
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId,
    );
    if (found) {
      return res.status(409).json({
        ver: "v2",
        success: false,
        message: "Student is already exists",
      });
    }

    const new_student = body;
    students.push(new_student);

    await writeDataFile(students);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.status(201).json({
      ver: "v2",
      success: true,
      data: new_student,
    });

    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.status(500).json({
      ver: "v2",
      success: false,
      message: "Internal sever error",
      error: err,
    });
  }
});

router.put("/students", async (req: Request, res: Response) => {
  try {
    // Read file from database
    const students = await readDataFile();

    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        ver: "v2",
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId,
    );

    if (foundIndex === -1) {
      return res.status(409).json({
        ver: "v2",
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    await writeDataFile(students);

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.status(200).json({
      ver: "v2",
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      ver: "v2",
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.delete("/students", async (req: Request, res: Response) => {
  try {
    const students = await readDataFile();

    const body = req.body;
    const parseResult = zStudentDeleteBody.safeParse(body);

    if (!parseResult.success) {
      return res.status(400).json({
        ver: "v2",
        success: false,
        message: "Validation failed",
        error: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = students.findIndex(
      (std: Student) => std.studentId === body.studentId,
    );

    if (foundIndex === -1) {
      return res.status(400).json({
        ver: "v2",
        success: false,
        message: "Student does not exists",
      });
    }

    // delete found student from array
    students.splice(foundIndex, 1);

    await writeDataFile(students);

    res.status(200).json({
      ver: "v2",
      success: true,
      message: `Student ${body.studentId} has been deleted successfully`,
    });
  } catch (err) {
    return res.status(500).json({
      ver: "v2",
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// /api/v2/enrollments
router.delete("/enrollments", async (req: Request, res: Response) => {
  try {
    const { studentId, courseNo } = req.body;

    // ตรวจสอบว่ามีข้อมูลส่งเข้ามาครบถ้วนหรือไม่
    if (!studentId || !courseNo) {
      return res.status(400).json({
        ver: "v2",
        success: false,
        message: "studentId and courseNo are required",
      });
    }

    const students: Student[] = await readDataFile();
    const courseIdNumber = Number(courseNo);

    // ค้นหานักเรียนตาม studentId
    const studentIndex = students.findIndex(
      (student) => student.studentId === studentId,
    );

    if (studentIndex === -1) {
      return res.status(404).json({
        ver: "v2",
        success: false,
        message: "Student not found",
      });
    }

    const targetStudent = students[studentIndex];

    if (!targetStudent.courses?.includes(courseIdNumber)) {
      return res.status(404).json({
        ver: "v2",
        success: false,
        message: "Course not found in student enrollments",
      });
    }

    targetStudent.courses = targetStudent.courses.filter(
      (id) => id !== courseIdNumber,
    );

    await writeDataFile(students);

    return res.status(200).json({
      ver: "v2",
      success: true,
      message: "Enrollment deleted successfully",
      data: {
        studentId: targetStudent.studentId,
        firstName: targetStudent.firstName,
        lastName: targetStudent.lastName,
        program: targetStudent.program,
        courses: targetStudent.courses,
      },
    });
  } catch (err) {
    return res.status(500).json({
      ver: "v2",
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

export default router;
