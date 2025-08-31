import express from 'express';
import { authenticateJWT } from '../middlewares/userInfo.middlewares';
import { edictUserInfo, getAllUser } from '../controllers/userInfo.controller';
import { uploadAvatar } from '../middlewares/fileUpload.middleware';
import path from 'path';

const userInfoRouter = express.Router();

userInfoRouter.patch('/edictUserInfo', uploadAvatar.single('avatar'), authenticateJWT, edictUserInfo);
userInfoRouter.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
userInfoRouter.get('/allUsers', authenticateJWT, getAllUser);
export default userInfoRouter;
