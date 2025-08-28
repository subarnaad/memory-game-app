import express from 'express';
import { Request, Response } from 'express';
import CONFIG from './config/dotenvConfig';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Application is running');
});

app.listen(CONFIG.DEV_PORT, () => {
  console.log(`server is running on ${CONFIG.DEV_HOST}:${CONFIG.DEV_PORT}`);
});
