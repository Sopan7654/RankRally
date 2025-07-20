import React, { useState, useMemo, useEffect, useCallback } from "react";
import io from 'socket.io-client';

// Import your components
import DecorativeBackground from "./components/DecorativeBackground";
import Leaderboard from "./components/Leaderboard";
import UserActions from "./components/UserActions";
import HistoryLog from "./components/HistoryLog";
import Notification from "./components/Notification";

// FIXED: Added '/api' to the end of the URL.
const API_URL = "https://rankrally-server.vercel.app/api";
// ADDED: The base URL for the WebSocket connection.
const SOCKET_URL = "https://rankrally-server.vercel.app";

export default function App() {
  // --- State Management ---
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  // --- Data Fetching & Real-Time Updates ---
  useEffect(() => {
    // Fetch initial data when the component first loads
    const fetchInitialData = async () => {
      try {
        const [usersRes, historyRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/history`),
        ]);
        const usersData = await usersRes.json();
        const historyData = await historyRes.json();
        if (usersRes.ok) setUsers(usersData);
        if (historyRes.ok) setHistory(historyData);
        if (usersData.length > 0 && !selectedUserId) {
          setSelectedUserId(usersData[0]._id);
        }
      } catch (error) {
        setNotification({ message: "Could not connect to the server.", type: "error" });
      }
    };
    fetchInitialData();

    // Establish WebSocket connection for real-time updates
    const socket = io(SOCKET_URL);
    socket.on('update', (data) => {
      setUsers(data.users);
      setHistory(data.history);
    });

    // Disconnect socket on cleanup
    return () => socket.disconnect();
  }, [selectedUserId]);


  // --- Sorting and Data Calculation ---
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => b.points - a.points),
    [users]
  );

  // --- Event Handlers (Updated to use API) ---
  const handleClaimPoints = useCallback(async () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotification({ message: data.message, type: "success" });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setNotification({ message: error.message || "Error claiming points.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId]);

  const handleAddUser = useCallback(async (e) => {
    // FIXED: Added event 'e' and preventDefault to stop page reloads.
    e.preventDefault();
    if (newUserName.trim()) {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newUserName.trim() }),
        });
        const newUser = await response.json();
        if (response.ok) {
          setNotification({ message: `User "${newUser.name}" added successfully!`, type: "success" });
          setNewUserName("");
        } else {
          throw new Error(newUser.message);
        }
      } catch (error) {
        setNotification({ message: error.message || "Error adding user.", type: "error" });
      }
    }
  }, [newUserName]);

  return (
    <div className="relative min-h-screen font-sans">
      <DecorativeBackground />
      <Notification
        message={notification.message}
        type={notification.type}
        onClear={() => setNotification({ message: "", type: "" })}
      />
      <div className="relative z-10">
        <header className="p-4 bg-white/30 backdrop-blur-sm">
          {/* REMOVED: Top navigation bar */}
          <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-700">
            <h1 className="text-2xl font-bold text-purple-800">RankRally</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* REMOVED: timeLeft and formatTime props */}
          <Leaderboard users={sortedUsers} />

          <div className="lg:col-span-1 flex flex-col gap-8">
            <UserActions
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
              onClaim={handleClaimPoints}
              onAddUser={handleAddUser}
              isLoading={isLoading}
              newUserName={newUserName}
              setNewUserName={setNewUserName}
            />
            <HistoryLog history={history} />
          </div>
        </main>
      </div>
    </div>
  );
}
