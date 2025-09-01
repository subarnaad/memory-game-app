"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Card {
  id: string;
  symbol: string;
  matched: boolean;
}

interface Game {
  id: string;
  state: string;
  moves: number;
  score: number;
  completed: boolean;
}

export default function GameHistory() {
  const [history, setHistory] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/game/history");
      const completedGames = data.filter((game: Game) => game.completed);
      setHistory(completedGames);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading)
    return <p className="text-center mt-10">Loading game history...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
  if (history.length === 0)
    return <p className="text-center mt-10">No completed games found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Completed Game History
      </h2>
      <span className="bg-slate-500 p-1 rounded absolute top-9 text-white hover:bg-slate-600">
        <Link href="/home">Go Back</Link>
      </span>
      <div className="flex flex-col gap-6">
        {history.map((game,i) => {
          const cards: Card[] = JSON.parse(game.state);

          return (
            <div
              key={game.id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p>
                    <strong>S.N:</strong> {i+1}
                  </p>
                  <p>
                    <strong>Moves:</strong> {game.moves}
                  </p>
                  <p>
                    <strong>Score:</strong> {game.score}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setExpandedGame(expandedGame === game.id ? null : game.id)
                  }
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {expandedGame === game.id ? "Hide Cards" : "View Cards"}
                </button>
              </div>

              {expandedGame === game.id && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`flex items-center justify-center h-16 w-16 rounded-lg font-bold text-xl
                        ${
                          card.matched
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-800"
                        }`}
                    >
                      {card.symbol}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
