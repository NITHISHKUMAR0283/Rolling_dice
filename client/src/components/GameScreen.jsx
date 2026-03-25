import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../App";
import VotingBar from "./VotingBar";
import Dice3D from "./Dice3D";
import Leaderboard from "./Leaderboard";
import PreviousRolls from "./PreviousRolls";
import Celebration from "./Celebration";

export default function GameScreen({ user }) {
  const socket = useContext(SocketContext);
  const [phase, setPhase] = useState({ phase: "waiting", round: 0, timer: 0 });
  const [votes, setVotes] = useState([]);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState({});
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [voted, setVoted] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    socket.on("phase", (data) => {
      setPhase(data);
      if (data.phase === "voting") {
        setVoted(null);
        setResult(null);
        setShowCelebration(false);
      }
      if (data.phase === "result") {
        setResult(data.result);
        setShowCelebration(true);
      }
    });
    socket.on("voteUpdate", setVotes);
    socket.on("leaderboard", setLeaderboard);
    socket.on("history", setHistory);
    socket.on("users", setUsers);
    // Initial fetch
    fetch("/api/leaderboard").then(r => r.json()).then(setLeaderboard);
    fetch("/api/history").then(r => r.json()).then(setHistory);
    return () => {
      socket.off("phase");
      socket.off("voteUpdate");
      socket.off("leaderboard");
      socket.off("history");
      socket.off("users");
    };
  }, [socket]);

  function handleVote(n) {
    if (phase.phase !== "voting" || voted) return;
    socket.emit("vote", n);
    setVoted(n);
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 items-center">
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center gap-3 mb-2">
          <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
          <span className="font-semibold">{user.name}</span>
        </div>
        <div className="text-lg font-bold">Round {phase.round}</div>
        <div className="text-sm text-gray-600 mb-2">Phase: {phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}</div>
        {phase.phase === "voting" && (
          <div className="text-center text-blue-600 font-semibold mb-2">Voting ends in {phase.timer} seconds</div>
        )}
      </div>
      <VotingBar votes={votes} voted={voted} onVote={handleVote} phase={phase.phase} />
      <Dice3D result={result} phase={phase.phase} />
      <PreviousRolls history={history} />
      <Leaderboard leaderboard={leaderboard} users={users} />
      {showCelebration && <Celebration result={result} voted={voted} user={user} users={users} />}
    </div>
  );
}
