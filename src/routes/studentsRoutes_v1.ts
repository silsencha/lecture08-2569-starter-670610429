// src/routes/studentsRoutes_v1.ts
import { Router, type Request, type Response } from "express";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
  zStudentId,
} from "../libs/studentValidator.js";

import type { Student } from "../libs/types.js";
import { success } from "zod";
import { tr } from "zod/locales";

// import database
import { students } from "../db/db.js";

// import endpoint not found middleware
import notFoundMiddleware from "../middlewares/notFoundMiddleware.js";
// create a new router
const router = Router();

// GET /students
// get students (by program)
router.get("/students", (req: Request, res: Response) => {
  try {
    const program = req.query.program;

    if (program) {
      let filtered_students = students.filter(
        (student) => student.program === program,
      );
      return res.status(200).json({
        success: true,
        data: filtered_students,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: students,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// GET /students/{studentId}
router.get("/students/:studentId", (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);

    // check validation result
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Balidation failed",
        error: result.error.issues[0],
      });
    }

    // check if student with the studentId exists in DB
    const foundIndex = students.findIndex((s) => s.studentId === studentId);
    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student not found!!!",
      });
    }

    // return student data
    return res.status(200).json({
      success: true,
      message: "ok",
      data: students[foundIndex],
    });
  } catch (err) {
    // if an unexpected error occurs, return error message
    return res.status(500).json({
      success: false,
      message: "Internal sever error",
      error: err,
    });
  }
});

// POST /students, body = {new student data}
// add a new student
router.post("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId,
    );
    if (found) {
      return res.status(204).json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.status(200).json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
router.put("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId,
    );

    if (foundIndex === -1) {
      return res.status(204).json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.status(200).json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
router.delete("/students", (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parseResult = zStudentDeleteBody.safeParse(body);

    if (!parseResult.success) {
      return res.status(400).json({
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
        success: false,
        message: "Student does not exists",
      });
    }

    // delete found student from array
    students.slice(foundIndex, foundIndex + 1);

    res.status(200).json({
      success: true,
      message: `Student ${body.studentId} has been deleted successfully`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

export default router;
