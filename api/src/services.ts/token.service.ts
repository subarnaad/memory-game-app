// import crypto from 'crypto';

// export class TokenService {
//   static generate() {
//     const token = crypto.randomBytes(32).toString('hex');
//     return {
//       token,
//       hash: crypto.createHash('sha256').update(token).digest('hex'),
//       expiry: new Date(Date.now() + 5 * 60 * 1000),
//     };
//   }

//   static validate(token: string, hashedToken: string) {
//     return crypto.createHash('sha256').update(token).digest('hex') === hashedToken;
//   }
// }


import crypto from 'crypto';

export class TokenService {
  static generateRefreshToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return { token, hash, expiry };
  }

  static generateAccessToken(userId: string) {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || '15m';
    return require('jsonwebtoken').sign({ userId }, secret, { expiresIn });
  }

  static validateRefreshToken(token: string, hash: string) {
    return crypto.createHash('sha256').update(token).digest('hex') === hash;
  }
}

