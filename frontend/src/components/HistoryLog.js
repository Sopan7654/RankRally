import React from 'react';

const HistoryLog = ({ history }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">Claim History</h2>
      {history.length > 0 ? (
        <ul className="space-y-2 text-sm max-h-96 overflow-y-auto pr-2">
          {history.map((entry) => (
            <li key={entry._id} className="p-3 bg-purple-100/50 rounded-lg flex justify-between items-center">
              <div><span className="font-bold text-purple-700">{entry.userName}</span><span className="text-gray-600"> claimed </span><span className="font-bold text-green-600">{entry.pointsGained} pts</span></div>
              <span className="text-gray-500 text-xs">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      ) : (<p className="text-gray-500 text-center py-4">No points claimed yet.</p>)}
    </div>
  );
};
export default HistoryLog;