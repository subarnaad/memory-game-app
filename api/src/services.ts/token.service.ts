import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class TokenService {
  static generateRefreshToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { token, hash, expiry };
  }

  static generateAccessToken(userId: string) {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    return require('jsonwebtoken').sign({ userId }, secret, { expiresIn });
  }
  //   static generateAccessToken(userId: string) {
  //     const secret = process.env.JWT_SECRET as Secret;
  //     const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  //     return jwt.sign({ userId }, secret, { expiresIn: expiresIn as String | number });
  //   }

  static validateRefreshToken(token: string, hash: string) {
    return crypto.createHash('sha256').update(token).digest('hex') === hash;
  }
}
