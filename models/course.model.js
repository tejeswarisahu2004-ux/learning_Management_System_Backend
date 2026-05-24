import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true
    },
    subTitle: {type:String}, 
    description:{ type:String},
    category:{
        type:String,
        required:true
    },
    courseLevel:{
        type:String,
        enum:["Beginner", "Medium", "Advanced"]
    },
    coursePrice:{
        type:Number
    },
    courseThumbnail:{
        type:String
    },
    enrolledStudents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Lecture"
        }
    ],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    duration: {
        type: String,
        default: "12h 30m"
    },
    articlesCount: {
        type: Number,
        default: 5
    },
    resourcesCount: {
        type: Number,
        default: 2
    },
    isMobileAccessible: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 4.8
    },
    views: {
        type: Number,
        default: 0
    }
}, {timestamps:true});

export const Course = mongoose.model("Course", courseSchema);
