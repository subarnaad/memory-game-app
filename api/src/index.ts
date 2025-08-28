import express from 'express';
import { Request, Response } from 'express';
import CONFIG from './config/dotenvConfig';
import authRouter from './routes/auth.route';
import userInfoRouter from './routes/userInfo.route';
import cors from 'cors';

import { setupSwagger } from './swagger';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ['*', 'http://localhost:3000'],
  }),
);

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Application is running');
});
app.use('/api', authRouter);
app.use('/api', userInfoRouter);

setupSwagger(app, `${CONFIG.DEV_HOST}:${CONFIG.DEV_PORT}/api`);

app.listen(CONFIG.DEV_PORT, () => {
  console.log(`server is running on ${CONFIG.DEV_HOST}:${CONFIG.DEV_PORT}`);
});
