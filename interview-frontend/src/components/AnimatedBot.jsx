import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AnimatedBot({ isSpeaking = false, isListening = false }) {
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (isSpeaking) {
      setShowBubble(true);
    } else {
      const timer = setTimeout(() => setShowBubble(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking]);

  return (
    <div className="relative flex justify-center">

      {showBubble && isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -top-8 bg-white px-4 py-2 
          rounded-full shadow-lg text-sm font-medium text-gray-800"
        >
          Speaking... 💬
        </motion.div>
      )}

      <motion.div
        animate={{
          y: isSpeaking ? [0, -8, 0] : [0, -12, 0],
          scale: isSpeaking ? [1, 1.05, 1] : 1
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking ? 0.6 : 3,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.08 }}
        onClick={() => setShowBubble(!showBubble)}
        className="cursor-pointer"
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isSpeaking ? "#10B981" : "#6366F1"} />
              <stop offset="100%" stopColor={isSpeaking ? "#34D399" : "#A855F7"} />
            </linearGradient>
            {isSpeaking && (
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Outer glow ring when speaking */}
          {isSpeaking && (
            <motion.circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}

          {/* Main body */}
          <circle 
            cx="100" 
            cy="100" 
            r="70" 
            fill="url(#grad)"
            filter={isSpeaking ? "url(#glow)" : ""}
          />
          
          {/* Eyes */}
          <motion.circle
            cx="80"
            cy="90"
            r="10"
            fill="white"
            animate={isSpeaking ? { scaleY: [1, 0.3, 1] } : {}}
            transition={isSpeaking ? { repeat: Infinity, duration: 0.3 } : {}}
          />
          <motion.circle
            cx="120"
            cy="90"
            r="10"
            fill="white"
            animate={isSpeaking ? { scaleY: [1, 0.3, 1] } : {}}
            transition={isSpeaking ? { repeat: Infinity, duration: 0.3 } : {}}
          />
          
          {/* Mouth - animated when speaking */}
          <motion.path
            d={isSpeaking ? "M75 120 Q100 130 125 120" : "M75 120 Q100 140 125 120"}
            stroke="white"
            strokeWidth="6"
            fill="none"
            animate={isSpeaking ? {
              d: [
                "M75 120 Q100 130 125 120",
                "M75 120 Q100 145 125 120",
                "M75 120 Q100 130 125 120"
              ]
            } : {}}
            transition={isSpeaking ? { repeat: Infinity, duration: 0.4 } : {}}
          />
          
          {/* Antenna */}
          <circle cx="100" cy="40" r="8" fill={isSpeaking ? "#10B981" : "#6366F1"} />
          <rect x="96" y="40" width="8" height="25" fill={isSpeaking ? "#10B981" : "#6366F1"} />
          
          {/* Sound waves when speaking */}
          {isSpeaking && (
            <>
              <motion.path
                d="M 140 100 Q 150 100 155 95"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
              />
              <motion.path
                d="M 145 100 Q 158 100 165 92"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
              />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}