import React from "react";

const UserActions = ({
  users,
  selectedUserId,
  onSelectUser,
  onClaim,
  onAddUser,
  isLoading,
  newUserName,
  setNewUserName,
}) => {
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    onAddUser();
  };
  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">
        User Actions
      </h2>
      <div className="grid grid-cols-1 gap-4 items-end">
        <select
          value={selectedUserId || ""}
          onChange={(e) => onSelectUser(e.target.value)}
          className="w-full p-3 bg-purple-100 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-gray-700"
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        <button
          onClick={onClaim}
          disabled={isLoading || !selectedUserId}
          className="w-full p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all transform hover:scale-105"
        >
          {isLoading ? "Claiming..." : "Claim Points"}
        </button>
      </div>
      <form onSubmit={handleAddUserSubmit} className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add New User
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="Enter name"
            className="flex-grow p-3 bg-purple-100 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-700"
          />
          <button
            type="submit"
            className="p-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};
export default UserActions;
