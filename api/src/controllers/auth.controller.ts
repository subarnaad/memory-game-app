import { userTable, refreshTokenTable, loginAttemptsTable, blackListToken } from '../db/schema';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { db } from '../migrate';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import validator from 'validator';
import { AuthenticatedRequest } from '../middlewares/userInfo.middlewares';
import { sendEmail } from '../utils/email.utills';
import { TokenService } from '../services.ts/token.service';
import Jwt from 'jsonwebtoken';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;

    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password format invalid',
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ Error: "password don't match! use same password as before" });
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ error: 'Please use a valid Gmail address' });
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Phone number must be exactly 10 digits.',
      });
    }
    const checkUserMailExist = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
    const checkUserNumberExist = await db.select().from(userTable).where(eq(userTable.phoneNumber, phoneNumber));
    if (checkUserMailExist.length > 0 || checkUserNumberExist.length > 0) {
      return res.status(400).json({ message: 'email or phone number already exist' });
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
    const { loginInput, password } = req.body;
    if (!loginInput || !password) return res.status(400).json({ message: 'Credentials required' });

    let user;
    if (/^\d+$/.test(loginInput)) {
      const phone = Number(loginInput);
      user = await db.select().from(userTable).where(eq(userTable.phoneNumber, phone)).limit(1);
    } else {
      user = await db.select().from(userTable).where(eq(userTable.email, loginInput)).limit(1);
    }

    if (!user.length) return res.status(400).json({ message: 'Invalid credentials' });
    const manxeko = user[0];

    const attempt = await db.select().from(loginAttemptsTable).where(eq(loginAttemptsTable.userId, manxeko.id)).limit(1);

    const now = new Date();
    if (attempt.length && attempt[0].lockUntil && now < attempt[0].lockUntil) {
      return res.status(403).json({ message: `Account locked. Try after ${attempt[0].lockUntil}` });
    }

    const isPasswordValid = await bcrypt.compare(password, manxeko.password);
    if (!isPasswordValid) {
      if (attempt.length) {
        const attempts = attempt[0].attempts + 1;
        const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await db.update(loginAttemptsTable).set({ attempts, lastAttempt: now, lockUntil }).where(eq(loginAttemptsTable.userId, manxeko.id));
      } else {
        await db.insert(loginAttemptsTable).values({ userId: manxeko.id, attempts: 1, lastAttempt: now });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await db.update(loginAttemptsTable).set({ attempts: 0, lockUntil: null }).where(eq(loginAttemptsTable.userId, manxeko.id));

    const accessToken = TokenService.generateAccessToken(manxeko.id);
    const { token: refreshToken, hash, expiry } = TokenService.generateRefreshToken();

    await db.insert(refreshTokenTable).values({ userId: manxeko.id, token: hash, expiresAt: expiry });

    return res.status(200).json({
      message: 'Signin successful',
      accessToken,
      refreshToken,
      user: { id: manxeko.id, name: manxeko.name, email: manxeko.email, phoneNumber: manxeko.phoneNumber },
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const tokenRecord = await db.select().from(refreshTokenTable).where(eq(refreshTokenTable.token, hashedToken)).limit(1);

  if (!tokenRecord.length) return res.status(403).json({ message: 'Invalid refresh token' });

  const now = new Date();
  if (now > tokenRecord[0].expiresAt) return res.status(403).json({ message: 'Refresh token expired' });

  const accessToken = TokenService.generateAccessToken(tokenRecord[0].userId);
  const { token: newRefreshToken, hash: newHash, expiry: newExpiry } = TokenService.generateRefreshToken();

  await db.update(refreshTokenTable).set({ token: newHash, expiresAt: newExpiry }).where(eq(refreshTokenTable.id, tokenRecord[0].id));

  res.status(200).json({ accessToken, refreshToken: newRefreshToken });
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

    const { token, hash, expiry } = TokenService.generateRefreshToken();
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


