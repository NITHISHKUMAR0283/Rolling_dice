import React from "react";

export default function PreviousRolls({ history }) {
  if (!history || !history.length) return null;
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="font-bold mb-2">Previous Rolls</div>
      <div className="flex gap-2 overflow-x-auto md:grid md:grid-cols-5">
        {history.slice(0, 10).map((num, i) => (
          <div
            key={i}
            className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-200 text-xl font-bold border border-gray-300"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
