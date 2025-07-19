import React, { useState, useMemo, useEffect, useCallback } from "react";

// Import your components
import DecorativeBackground from "./components/DecorativeBackground";
import Leaderboard from "./components/Leaderboard";
import UserActions from "./components/UserActions";
import HistoryLog from "./components/HistoryLog";
import Notification from "./components/Notification";

// The API base URL for your backend
const API_URL = "https://rankrally-server.vercel.app/";

export default function App() {
  // --- State Management ---
  const [users, setUsers] = useState([]);
  const [rankingType, setRankingType] = useState("Hourly");
  const [timeLeft, setTimeLeft] = useState(45 * 60 + 34);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  // --- Data Fetching from Backend ---
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();

      // FIXED: Check if the response was successful and is an array
      if (response.ok) {
        setUsers(data);
        // Set the default selected user once data is fetched
        if (data.length > 0 && !selectedUserId) {
          setSelectedUserId(data[0]._id);
        }
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]); // Ensure users is an empty array on error to prevent crashes
      setNotification({
        message: error.message || "Could not connect to the server.",
        type: "error",
      });
    }
  }, [selectedUserId]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/history`);
      const data = await response.json();

      // FIXED: Check if the response was successful
      if (response.ok) {
        setHistory(data);
      } else {
        throw new Error(data.message || "Failed to fetch history");
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistory([]); // Ensure history is an empty array on error
    }
  }, []);

  // Fetch initial data when the component mounts
  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, [fetchUsers, fetchHistory]);

  // --- Sorting and Data Calculation (No change needed here) ---
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
        // Refetch users and history to get the latest data
        fetchUsers();
        fetchHistory();
        setNotification({ message: data.message, type: "success" });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Failed to claim points:", error);
      setNotification({
        message: error.message || "Error claiming points.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId, fetchUsers, fetchHistory]);

  const handleAddUser = useCallback(async () => {
    if (newUserName.trim()) {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newUserName.trim() }),
        });
        const newUser = await response.json();
        if (response.ok) {
          // Refetch users to update the list
          fetchUsers();
          setNotification({
            message: `User "${newUser.name}" added successfully!`,
            type: "success",
          });
          setNewUserName("");
        } else {
          throw new Error(newUser.message);
        }
      } catch (error) {
        console.error("Failed to add user:", error);
        setNotification({
          message: error.message || "Error adding user.",
          type: "error",
        });
      }
    }
  }, [newUserName, fetchUsers]);

  // --- Countdown Timer Effect (No change needed here) ---
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(
      () => setTimeLeft((prevTime) => prevTime - 1),
      1000
    );
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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
          <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-700">
            <h1 className="text-2xl font-bold text-purple-800">RankRally</h1>
            {/* <nav className="flex justify-center space-x-6 text-base font-semibold">
              {["Live", "Hourly", "Family", "Wealth"].map((type) => (
                <button
                  key={type}
                  onClick={() => setRankingType(type)}
                  className={`pb-1 transition-all duration-300 ${
                    rankingType === type
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-purple-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </nav> */}
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Leaderboard
            users={sortedUsers}
            formatTime={formatTime}
            timeLeft={timeLeft}
          />

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
