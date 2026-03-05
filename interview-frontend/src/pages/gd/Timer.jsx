import React, { useEffect, useState } from "react";

const Timer = ({ createdAt, limitMinutes }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff =
        limitMinutes * 60 -
        Math.floor((now - new Date(createdAt)) / 1000);

      setRemaining(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, limitMinutes]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="text-white font-bold">
      ⏱ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};

export default Timer;