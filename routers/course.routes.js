import express from "express";
import {
  createCourse,
  createLecture,
  editCourse,
  editLecture,
  getAllPublishedCourses,
  getCourseById,
  getCourseLecture,
  getCreatorCourses,
  getEnrolledCourses,
  getLectureById,
  removeLecture,
  togglePublishCourse,
} from "../controllers/course.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/published", getAllPublishedCourses);
router.get("/enrolled", isAuthenticated, getEnrolledCourses);
router.post("/", isAuthenticated, createCourse);
router.get("/", isAuthenticated, getCreatorCourses);
router.get("/:courseId", isAuthenticated, getCourseById);
router.put(
  "/:courseId",
  isAuthenticated,
  upload.single("courseThumbnail"),
  editCourse,
);
router.post("/:courseId/lecture", isAuthenticated, createLecture);
router.get("/:courseId/lecture", isAuthenticated, getCourseLecture);
router.post("/:courseId/lecture/:lectureId", isAuthenticated, editLecture);
router.delete("/lecture/:lectureId", isAuthenticated, removeLecture);
router.get("/lecture/:lectureId", isAuthenticated, getLectureById);
router.patch("/:courseId", isAuthenticated, togglePublishCourse);

export default router;
