import express from 'express';
import { signup, signin, forgotPassword, changePassword, logout, createNewPassword, refreshAccessToken } from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/signup', signup);

authRouter.post('/signin', signin);

authRouter.post('/forgotPassword', forgotPassword);

authRouter.post('/createNewPassword', createNewPassword);

authRouter.post('/changePassword', changePassword);

authRouter.post('/log-out', logout);

authRouter.post('/refresh-token', refreshAccessToken);


export default authRouter;
