import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import {
  DeleteMediaFromCloudinary,
  DeleteVideoFromCloudinary,
  UploadMedia,
} from "../utils/cloudinary.js";

export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "enrolledCourses",
      populate: {
        path: "creator",
        select: "name photoUrl",
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Enrolled courses fetched",
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch enrolled courses" });
  }
};

export const getAllPublishedCourses = async (req, res) => {
  try {
    const { search = "", category = "", level = "", sort = "" } = req.query;
    
    let query = { isPublished: true };
    
    if (search) {
      query.$or = [
        { courseTitle: { $regex: search, $options: "i" } },
        { subTitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.courseLevel = level;
    }
    
    let sortOptions = {};
    if (sort === "low") {
      sortOptions.coursePrice = 1;
    } else if (sort === "high") {
      sortOptions.coursePrice = -1;
    } else {
      sortOptions.createdAt = -1; // default sort by newest
    }

    const courses = await Course.find(query)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);

    if (!courses || courses.length === 0) {
      return res
        .status(200)
        .json({ courses: [], success: true, message: "No courses found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Courses Fetch successfully", courses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch courses" });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;

    if (!courseTitle || !category) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res
      .status(201)
      .json({ success: true, course, messsage: "Course Created" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create course" });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });

    if (!courses) {
      return res
        .status(404)
        .json({ courses: [], success: false, message: "No courses found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Courses Fetch successfully", courses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch courses" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
      .populate("lectures")
      .populate({ path: "creator", select: "name photoUrl" });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      course,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch course" });
  }
};

export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      duration,
      articlesCount,
      resourcesCount,
      isMobileAccessible,
      rating,
      views,
    } = req.body;

    const thumbnail = req.file;

    let course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    let courseThumbnail = course.courseThumbnail;

    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await DeleteMediaFromCloudinary(publicId);
      }
      const cloudResponse = await UploadMedia(thumbnail.path);
      courseThumbnail = cloudResponse.secure_url;
    }

    const updatedCourse = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail,
      duration: duration !== undefined ? duration : course.duration,
      articlesCount: articlesCount !== undefined ? Number(articlesCount) : course.articlesCount,
      resourcesCount: resourcesCount !== undefined ? Number(resourcesCount) : course.resourcesCount,
      isMobileAccessible: isMobileAccessible !== undefined ? isMobileAccessible === "true" || isMobileAccessible === true : course.isMobileAccessible,
      rating: rating !== undefined ? Number(rating) : course.rating,
      views: views !== undefined ? Number(views) : course.views,
    };

    course = await Course.findByIdAndUpdate(courseId, updatedCourse, {
      new: true,
    });

    return res
      .status(200)
      .json({ success: true, message: "Course updated successfully", course });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update course" });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;
    if (!lectureTitle || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Lecture title is required." });
    }
    const lecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);

    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create lecture" });
  }
};

export const getCourseLecture = async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId).populate("lectures");
  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
  }
  return res.status(200).json({ success: true, lectures: course.lectures });
};

export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }
    if (lectureTitle) {
      lecture.lectureTitle = lectureTitle;
    }
    if (videoInfo?.videoUrl) {
      lecture.videoUrl = videoInfo.videoUrl;
    }
    if (videoInfo?.publicId) {
      lecture.publicId = videoInfo.publicId;
    }
    lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    const course = await Course.findById(courseId);

    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to edit lecture",
    });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const lecture = Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }
    if (lecture.publicId) {
      await DeleteVideoFromCloudinary(lecture.publicId);
    }

    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } },
    );

    return res.status(200).json({
      success: true,
      message: "Lecture removed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove lecture",
    });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }
    return res.status(200).json({
      success: true,
      lecture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get lecture",
    });
  }
};

export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    course.isPublished = publish === "true";
    await course.save();

    const publishStatus = course.isPublished ? "Published" : "UnPublished";
    return res.json({
      success: true,
      message: `Course ${publishStatus} successfully`,
      course,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to toggle publish course",
      error: error.message,
    });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    user.enrolledCourses.push(courseId);
    await user.save();

    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in the course",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to enroll in the course" });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const creatorId = req.id;
    const courses = await Course.find({ creator: creatorId }).populate("enrolledStudents");

    if (!courses) {
      return res.status(200).json({
        success: true,
        totalSales: 0,
        totalStudents: 0,
        totalCourses: 0,
        courses: [],
      });
    }

    const totalCourses = courses.length;
    
    // Count unique enrolled students across all instructor's courses
    const uniqueStudents = new Set();
    let totalSales = 0;
    
    courses.forEach((course) => {
      if (course.enrolledStudents) {
        course.enrolledStudents.forEach((student) => {
          uniqueStudents.add(student._id.toString());
        });
        totalSales += (course.coursePrice || 0) * course.enrolledStudents.length;
      }
    });

    const totalStudents = uniqueStudents.size;

    return res.status(200).json({
      success: true,
      totalSales,
      totalStudents,
      totalCourses,
      courses: courses.map(c => ({
        _id: c._id,
        courseTitle: c.courseTitle,
        coursePrice: c.coursePrice,
        enrolledStudentsCount: c.enrolledStudents ? c.enrolledStudents.length : 0,
        isPublished: c.isPublished,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};
