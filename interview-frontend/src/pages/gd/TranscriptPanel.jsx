import React from "react";

const TranscriptPanel = ({ messages = [] }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl h-40 overflow-y-auto">
      {messages.length === 0 ? (
        <p className="text-sm text-gray-400">No discussion yet...</p>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className="text-sm mb-1">
            <strong>{msg.speaker?.toUpperCase()}:</strong> {msg.text}
          </div>
        ))
      )}
    </div>
  );
};

export default TranscriptPanel;