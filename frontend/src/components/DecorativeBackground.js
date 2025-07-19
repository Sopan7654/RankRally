import React from "react";

const DecorativeBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
    >
      <defs>
        <linearGradient id="bg-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-gradient)" />
      <path
        d="M-100 200 Q -50 100 0 200 T 100 200"
        stroke="#D8B4FE"
        fill="none"
        strokeWidth="80"
        strokeOpacity="0.3"
      />
      <path
        d="M calc(100% + 100px) 600 Q calc(100% + 50px) 500 100% 600 T calc(100% - 100px) 600"
        stroke="#FBCFE8"
        fill="none"
        strokeWidth="60"
        strokeOpacity="0.4"
      />
    </svg>
  </div>
);
export default DecorativeBackground;
