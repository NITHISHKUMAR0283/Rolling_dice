import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import JoinScreen from "./components/JoinScreen";
import GameScreen from "./components/GameScreen";

const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:4000");

export const SocketContext = React.createContext();

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <SocketContext.Provider value={socket}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        {!user ? (
          <JoinScreen setUser={setUser} />
        ) : (
          <GameScreen user={user} />
        )}
      </div>
    </SocketContext.Provider>
  );
}
