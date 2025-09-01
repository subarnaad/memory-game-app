"use client";

import Link from "next/link";
import React from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

const Page = () => {
  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refresh_token");

      if (!refreshToken) {
        alert("No refresh token found!");
        return;
      }

      const response = await api.post("/log-out", { refreshToken });

      if (response.status === 200) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        alert("Logged out successfully!");
        window.location.href = "/";
      } else {
        alert("Logout failed: " + response.data.message);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(
        "An error occurred while logging out: " +
          err?.response?.data?.message || err.message
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-6">
      <h1 className="text-3xl text-slate-900">Welcome to Memory Game</h1>
      <Link
        className="text-lg text-slate-900 bg-blue-500 p-2 rounded-2xl hover:bg-blue-300 transition"
        href="/game"
      >
        Start Game
      </Link>
      <Link
        className="text-lg text-slate-900 bg-yellow-300 p-2 rounded-2xl hover:bg-yellow-200 transition"
        href="/game/record"
      >
        My Records
      </Link>
      <button
        onClick={handleLogout}
        className="fixed bottom-3 right-3 bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-400"
      >
        Logout
      </button>
    </div>
  );
};

export default Page;
