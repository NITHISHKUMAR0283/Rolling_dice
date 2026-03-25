import React from "react";

const NUMBERS = [1, 2, 3, 4, 5, 6];

export default function VotingBar({ votes, voted, onVote, phase }) {
  const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex justify-between mb-2">
        {NUMBERS.map(n => (
          <button
            key={n}
            disabled={phase !== "voting" || voted}
            onClick={() => onVote(n)}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg transition
              ${voted === n ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-100 border-gray-300 hover:bg-blue-100'}
              ${phase !== "voting" || voted ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {NUMBERS.map((n, i) => (
          <div key={n} className="flex items-center gap-2">
            <span className="w-5 text-right">{n}</span>
            <div className="flex-1 bg-gray-200 rounded h-4 relative">
              <div
                className="bg-blue-400 h-4 rounded"
                style={{ width: `${votes[i]?.percent || 0}%` }}
              ></div>
              <span className="absolute left-2 text-xs text-white font-bold">
                {votes[i]?.count || 0}
              </span>
            </div>
            <span className="w-8 text-xs text-gray-600">{votes[i]?.percent || 0}%</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-1">Total votes: {totalVotes}</div>
    </div>
  );
}
