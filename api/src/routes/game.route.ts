import express from 'express';
import { startGame, makeMove, gameHistory } from '../controllers/game.controller';
import { authenticateJWT } from '../middlewares/userInfo.middlewares';

const gameRouter = express.Router();

gameRouter.post('/new-game', authenticateJWT, startGame);
gameRouter.post('/make-move', authenticateJWT, makeMove);
gameRouter.get('/history', authenticateJWT, gameHistory);

export default gameRouter;
