// import jwt from 'jsonwebtoken';
// const generateToken = (id: string, email: string) => {
//   const token = jwt.sign({ Id: id, email }, process.env.JWT_SECRET!, {
//     expiresIn: '15d',
//   });
//   return token;
// };

// export default generateToken;

import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (id: string) => {
  return jwt.sign({ Id: id }, ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: '7d' });
};
