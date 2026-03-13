import express from 'express';

const router = express.Router();

import upload from '../utils/multer.js';
import { UploadMedia } from '../utils/cloudinary.js';

router.post('/uploadvideo', upload.single("file"), async (req, res) => {
    try {
        const result = await UploadMedia(req.file.path);
        return res.status(200).json({
            success: true,
            message: "Video uploaded successfully",
            data: result,
        });
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            success: false,
            message: "Failed to upload video",
        })
    }
})


export default router;
