import express from 'express';
import { getProfile, login, logout, signup, updateProfile } from '../controllers/auth.controller.js'
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.post('/register', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/profile', isAuthenticated, getProfile);
router.put('/profile/update', isAuthenticated , upload.single("profilePhoto"), updateProfile);


export default router;