
import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../App";


// Use DiceBear Toon Head avatars with different seeds
const AVATARS = [
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Felix",
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Alex",
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Sam",
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Jamie",
  "https://api.dicebear.com/9.x/toon-head/svg?seed=Taylor"
];

export default function JoinScreen({ setUser }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [avatars, setAvatars] = useState(AVATARS);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Optionally fetch avatars from backend
    // fetch("/api/avatars").then(res => res.json()).then(setAvatars);
  }, []);

  function handleJoin(e) {
    e.preventDefault();
    if (!name.trim()) return;
    socket.emit("join", { name, avatar });
    setUser({ name, avatar });
  }

  return (
    <form onSubmit={handleJoin} className="bg-white p-6 rounded-xl shadow-md w-full max-w-xs flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center">Join Game</h2>
      <input
        className="border rounded px-3 py-2 focus:outline-none focus:ring"
        placeholder="Enter your name"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={16}
        required
      />
      <div>
        <div className="mb-2 text-sm font-medium">Choose Avatar</div>
        <div className="flex gap-2 justify-center">
          {avatars.map((a, i) => (
            <button
              type="button"
              key={a}
              className={`rounded-full border-2 ${avatar === a ? 'border-blue-500' : 'border-transparent'} focus:outline-none`}
              onClick={() => setAvatar(a)}
            >
              <img src={a} alt="avatar" className="w-12 h-12 object-cover rounded-full bg-white" />
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded mt-2 transition"
      >
        Join
      </button>
    </form>
  );
}
