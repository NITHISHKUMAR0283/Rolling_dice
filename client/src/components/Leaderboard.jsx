import React from "react";

export default function Leaderboard({ leaderboard, users }) {
  const sorted = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 mt-2">
      <div className="font-bold mb-2 text-lg">Leaderboard</div>
      <ol className="list-decimal pl-5">
        {sorted.map(([name, score], i) => {
          const user = users.find(u => u.name === name);
          return (
            <li key={name} className="flex items-center gap-2 mb-1">
              {user && <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />}
              <span className="font-semibold">{name}</span>
              <span className="ml-auto font-mono">{score}</span>
              {i === 0 && <span className="ml-2 text-yellow-500">★</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
