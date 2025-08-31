import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { blackListToken } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../migrate';

export interface AuthenticatedRequest extends Request {
  Id?: string;
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('token in user middleware:', token);

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  try {
    const checkBlackListedToken = await db.select().from(blackListToken).where(eq(blackListToken.token, token)).limit(0);
    if (checkBlackListedToken.length > 0) {
      return res.status(401).json({ message: 'token is blacklisted' });
    }
    const secret = process.env.JWT_SECRET as jwt.Secret;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, secret) as { userId: string };
    console.log('Decoded Token:', decoded);

    req.Id = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
