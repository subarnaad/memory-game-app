import { Request, response, Response } from 'express';
import { db } from '../migrate';
import { games } from '../db/schema';
import { generateShuffledCards } from '../utils/shuffle.utill';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const startGame = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const cards = generateShuffledCards();

    const [game] = await db
      .insert(games)
      .values({
        id: uuidv4(),
        userId,
        state: JSON.stringify(cards),
        moves: 0,
        score: 0,
        completed: false,
      })
      .returning();

    return res.status(200).json({
      message: 'new game created ready to start',
      gameId: game.id,
      cards: cards.map((c) => ({ id: c.id, matched: false })),
    });
  } catch (error) {
    console.error(startGame, error);
    return res.status(500).json({ message: 'internal server error' });
  }
};

export const makeMove = async (req: Request, res: Response) => {
  const { gameId, firstId, secondId } = req.body;
  if (!gameId || !firstId || !secondId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const [game] = await db.select().from(games).where(eq(games.id, gameId));
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.completed) return res.status(400).json({ error: 'Game already finished' });

  let state = JSON.parse(game.state) as any[];
  let moves = game.moves + 1;
  let score = game.score;

  const first = state.find((c) => c.id === firstId);
  const second = state.find((c) => c.id === secondId);

  if (!first || !second) return res.status(400).json({ error: 'Invalid card ids' });

  let matched = false;
  if (first.symbol === second.symbol && !first.matched && !second.matched) {
    first.matched = true;
    second.matched = true;
    score += 10;
    matched = true;
  } else {
    score -= 2;
  }

  const completed = state.every((c) => c.matched);

  await db
    .update(games)
    .set({
      state: JSON.stringify(state),
      moves,
      score,
      completed,
    })
    .where(eq(games.id, gameId));

  return res.json({
    matched,
    moves,
    score,
    completed,
    cards: state.map((c) => ({ id: c.id, matched: c.matched })),
  });
};

export const gameHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const history = await db.select().from(games).where(eq(games.userId, userId));
  return res.json(history);
};
