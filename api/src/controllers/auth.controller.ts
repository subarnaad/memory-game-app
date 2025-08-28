import { userTable, blackListToken } from '../db/schema';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { db } from '../migrate';
import { eq } from 'drizzle-orm';
import generateToken from '../utils/generateToken.utill';
import validator from 'validator';
import { AuthenticatedRequest } from '../middlewares/userInfo.middlewares';
import { sendEmail } from '../utils/email.utills';
import { TokenService } from '../services.ts/token.service';
import Jwt from 'jsonwebtoken';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      return res.status(400).json({ Error: 'fill all feilds' });
    }
    if (password.length < 8) {
      return res.status(400).json({ Error: 'Password must be at least 8 characters long' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ Error: "password don't match! use same password as before" });
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ error: 'Please use a valid Gmail address' });
    }
    const checkUserExist = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
    if (checkUserExist.length > 0) {
      return res.status(400).json({ message: 'mail already exist' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.insert(userTable).values({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    if (newUser) {
      return res.status(201).json({ message: 'user created' });
    }
  } catch (error) {
    console.error(signup, error);
    res.status(500).json({ message: 'internal server error' });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'invalid credential' });
    }

    const getUsermail = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
    if (getUsermail.length === 0) {
      return res.status(400).json({ message: 'invalid credential' });
    }
    const user = getUsermail[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ Message: 'invalid credential' });
    }
    const token = generateToken(user.id, email);
    return res.status(200).json({
      message: 'Signin successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error(signin, error);
    return res.status(400).json({ message: 'internal server error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'fill all the fields' });
    }
    const { Id } = req;
    if (!Id) {
      return res.status(401).json({ message: 'Unauthorized User.' });
    }

    const user = await db.select().from(userTable).where(eq(userTable.id, Id)).execute();
    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user[0].password);
    if (!isOldPasswordMatch) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.update(userTable).set({ password: hashedPassword }).where(eq(userTable.id, Id)).execute();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(changePassword, error);
    return res.status(400).json({ message: 'internal server error' });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    const user = await db.select().from(userTable).where(eq(userTable.email, email)).execute();
    if (!user?.length) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { token, hash, expiry } = TokenService.generate();
    await db.update(userTable).set({ resetToken: hash, resetTokenExpiry: expiry }).where(eq(userTable.id, user[0].id)).execute();

    const resetURL = `${process.env.CLIENTRESET_URL}/reset-password/${token}`;
    await sendEmail(email, 'Password Reset Request', `Reset your password: ${resetURL}\nExpires in 5 minutes.`);

    return res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('forgotPassword:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createNewPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { resetToken, newPassword } = req.body;

  try {
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    let decoded;
    let secret = process.env.JWT_SECRET as string;
    try {
      decoded = Jwt.verify(resetToken, secret);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    const userId = req.Id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(userTable)
      .set({ password: hashedPassword })
      .where(eq(userTable.id, userId as string))
      .execute();

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error in createNewPassword:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ message: 'Authorization token is required.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(404).json({ message: 'JWT_SECRET is not defined.' });
    }
    const decoded = Jwt.verify(token, secret) as { exp: number };
    if (!decoded?.exp) {
      return res.status(400).json({ message: 'Invalid token.' });
    }
    const expiryAt = new Date(decoded.exp * 1000);
    await db.insert(blackListToken).values({
      token,
      expiry: expiryAt,
    });

    res.clearCookie('auth_token');
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
