import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Notification = ({ message, type, onClear }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    }
  }, [message]);

  if (!message || !visible) return null;

  const baseClasses =
    "fixed top-6 right-6 flex items-center gap-4 max-w-sm w-full px-5 py-4 rounded-xl shadow-lg transition-all duration-500 ease-in-out z-50";

  const typeStyles = {
    success: {
      bg: 'bg-green-600',
      icon: <CheckCircle className="w-6 h-6 text-white" />
    },
    error: {
      bg: 'bg-red-600',
      icon: <XCircle className="w-6 h-6 text-white" />
    }
  };

  const { bg, icon } = typeStyles[type] || typeStyles.error;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClear, 300); // Call parent clear function after animation
  };

  return (
    <div className={`${baseClasses} ${bg} ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <p className="text-white font-medium text-sm flex-1">
        {message}
      </p>
      <button onClick={handleClose}>
        <X className="w-5 h-5 text-white hover:scale-110 transition" />
      </button>
    </div>
  );
};

export default Notification;
