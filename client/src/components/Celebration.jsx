import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Celebration({ result, voted, user, users }) {
  const didWin = voted === result;
  const winners = users.filter(u => u.score && u.score > 0 && u.id !== user.id && voted === result);
  const ref = useRef(false);

  useEffect(() => {
    if (didWin && !ref.current) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      ref.current = true;
    }
  }, [didWin]);

  if (!didWin) return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
      <div className="bg-white px-6 py-3 rounded-xl shadow-lg border-2 border-blue-400 animate-bounce">
        <div className="text-2xl font-bold text-green-600 mb-2">🎉 Correct Prediction! 🎉</div>
        <div className="flex gap-2 items-center justify-center">
          <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
          <span className="font-semibold">{user.name}</span>
        </div>
      </div>
    </div>
  );
}
