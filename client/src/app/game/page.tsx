"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Card {
  id: number;
  symbol: string;
  matched?: boolean;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [gameId, setGameId] = useState<string | null>(null);

  const startGame = async () => {
    try {
      const { data } = await api.post("/game/new-game");
      setGameId(data.gameId);
      setCards(data.cards);
      setFlipped([]);
      setGameOver(false);
      setMoves(0);
      setTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTime((prev) => prev + 1), 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Failed to start game:",
        error.response?.data || error.message
      );
    }
  };

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id)) return;
    setFlipped((prev) => [...prev, id]);
  };

  useEffect(() => {
    if (flipped.length === 2 && gameId) {
      const [firstId, secondId] = flipped;

      const timeout = setTimeout(() => setFlipped([]), 800);

      api
        .post("/game/make-move", { gameId, firstId, secondId })
        .then((res) => {
          setCards(res.data.cards);
          setMoves(res.data.moves);
          setGameOver(res.data.completed);
        })
        .catch((err) => console.error("Move failed:", err));

      return () => clearTimeout(timeout);
    }
  }, [flipped, gameId]);

  useEffect(() => {
    startGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameOver && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameOver]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-6">
      <div className="flex gap-8 text-lg font-semibold text-slate-900">
        <p>⏱ Time: {time}s</p>
        <p>🎯 Moves: {moves}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 p-6 bg-white rounded-2xl shadow-lg">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <div
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`flex items-center justify-center h-20 w-20 rounded-lg cursor-pointer text-2xl font-bold transition-transform duration-300
                ${isFlipped ? "bg-blue-500 text-white" : "bg-gray-400"}`}
            >
              {isFlipped ? card.symbol : "X"}
            </div>
          );
        })}
      </div>

      {gameOver ? (
        <div className="text-center">
          <p className="text-xl font-semibold mb-3 text-slate-900">
            You matched all pairs in {moves} moves and {time}s!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition"
          >
            Restart Game
          </button>
        </div>
      ) : (
        <button
          onClick={startGame}
          className="cursor-pointer px-6 py-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
        >
          Restart
        </button>
      )}
      <Link
        className="cursor-pointer px-6 py-2 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-900 transition"
        href="/home"
      >
        Quit Game
      </Link>
    </div>
  );
}
