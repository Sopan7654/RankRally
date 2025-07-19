// src/components/Leaderboard.js
import React from "react";
import { CrownIcon, FireIcon } from "./icons";

const Leaderboard = ({ users, formatTime, timeLeft }) => {
  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  return (
    <div className="lg:col-span-2">
      {topThree.length >= 3 && (
        <div className="relative flex justify-center items-end h-64">
          <div className="absolute bottom-0 -translate-x-24 lg:-translate-x-32 text-center transform-gpu transition-transform hover:scale-105">
            <div className="relative">
              <img
                src={topThree[1].img}
                alt={topThree[1].name}
                className="w-24 h-24 rounded-full border-4 border-slate-300 shadow-lg mx-auto"
              />
              <span className="absolute -top-2 -left-2 w-8 h-8 flex items-center justify-center bg-slate-400 text-white font-bold text-lg rounded-full">
                2
              </span>
            </div>
            <h3 className="font-bold mt-2 text-gray-800 truncate w-24">
              {topThree[1].name}
            </h3>
            <p className="text-sm text-orange-500 font-semibold">
              <FireIcon /> {topThree[1].points.toLocaleString()}
            </p>
          </div>
          <div className="relative z-10 text-center transform-gpu transition-transform hover:scale-105">
            <div className="relative">
              <img
                src={topThree[0].img}
                alt={topThree[0].name}
                className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl mx-auto"
              />
              <CrownIcon />
              <span className="absolute -top-2 -left-2 w-10 h-10 flex items-center justify-center bg-yellow-400 text-white font-bold text-xl rounded-full">
                1
              </span>
            </div>
            <h3 className="font-bold mt-2 text-gray-800 truncate w-32">
              {topThree[0].name}
            </h3>
            <p className="text-sm text-orange-500 font-semibold">
              <FireIcon /> {topThree[0].points.toLocaleString()}
            </p>
          </div>
          <div className="absolute bottom-0 translate-x-24 lg:translate-x-32 text-center transform-gpu transition-transform hover:scale-105">
            <div className="relative">
              <img
                src={topThree[2].img}
                alt={topThree[2].name}
                className="w-24 h-24 rounded-full border-4 border-yellow-600 shadow-lg mx-auto"
              />
              <span className="absolute -top-2 -left-2 w-8 h-8 flex items-center justify-center bg-yellow-600 text-white font-bold text-lg rounded-full">
                3
              </span>
            </div>
            <h3 className="font-bold mt-2 text-gray-800 truncate w-24">
              {topThree[2].name}
            </h3>
            <p className="text-sm text-orange-500 font-semibold">
              <FireIcon /> {topThree[2].points.toLocaleString()}
            </p>
          </div>
        </div>
      )}
      <div className="mt-8 bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md">
        <ul className="space-y-3">
          {restOfUsers.map((user, index) => (
            <li
              key={user._id}
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-purple-100/50 transition-colors"
            >
              <span className="font-bold text-gray-500 w-8 text-center text-lg">
                {index + 4}
              </span>
              <img
                src={user.img}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-grow">
                <p className="font-semibold text-gray-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">ID: {user._id}</p>
              </div>
              <div className="text-orange-500 font-bold text-base">
                <FireIcon /> {user.points.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default Leaderboard;
