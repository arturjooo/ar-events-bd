"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  eventDateTime: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isHappeningNow: boolean;
}

export default function CountdownTimer({ eventDateTime, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    isHappeningNow: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date(eventDateTime);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        // Check if event is happening now (within 3 hours of start time)
        const threeHoursAfterStart = eventDate.getTime() + (3 * 60 * 60 * 1000);
        if (now.getTime() <= threeHoursAfterStart) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: false,
            isHappeningNow: true
          };
        }
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
          isHappeningNow: false
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
        isHappeningNow: false
      };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDateTime]);

  if (timeLeft.isHappeningNow) {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500/50 rounded-full ${className}`}
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-green-400 font-bold text-sm">HAPPENING NOW</span>
      </motion.div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/50 rounded-full ${className}`}
      >
        <span className="text-red-400 font-bold text-sm">EVENT ENDED</span>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-4 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-2 min-w-[50px] shadow-lg shadow-purple-500/30 border border-purple-500/50">
            <div className="text-white font-bold text-lg">{String(timeLeft.days).padStart(2, '0')}</div>
          </div>
          <div className="text-gray-400 text-xs mt-1">DAYS</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-2 min-w-[50px] shadow-lg shadow-purple-500/30 border border-purple-500/50">
            <div className="text-white font-bold text-lg">{String(timeLeft.hours).padStart(2, '0')}</div>
          </div>
          <div className="text-gray-400 text-xs mt-1">HOURS</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-2 min-w-[50px] shadow-lg shadow-purple-500/30 border border-purple-500/50">
            <div className="text-white font-bold text-lg">{String(timeLeft.minutes).padStart(2, '0')}</div>
          </div>
          <div className="text-gray-400 text-xs mt-1">MINS</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-2 min-w-[50px] shadow-lg shadow-purple-500/30 border border-purple-500/50">
            <div className="text-white font-bold text-lg">{String(timeLeft.seconds).padStart(2, '0')}</div>
          </div>
          <div className="text-gray-400 text-xs mt-1">SECS</div>
        </motion.div>
      </div>
    </div>
  );
}
