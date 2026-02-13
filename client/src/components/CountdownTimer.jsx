import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetDate, label, onComplete }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      if (Object.keys(newTime).length === 0) {
        onComplete && onComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] === undefined) {
      return;
    }

    timerComponents.push(
      <span key={interval} className="flex flex-col items-center mx-1">
        <span className="text-lg font-bold font-mono bg-primary/10 px-2 py-1 rounded">
            {timeLeft[interval].toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] uppercase font-bold text-gray-400">{interval.charAt(0)}</span>
      </span>
    );
  });

  return (
    <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
      <div className="bg-accent/20 p-2 rounded-full">
        <Clock className="w-4 h-4 text-accent" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</span>
        <div className="flex items-center">
            {timerComponents.length ? timerComponents : <span className="text-sm font-bold text-accent">Active Now</span>}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
