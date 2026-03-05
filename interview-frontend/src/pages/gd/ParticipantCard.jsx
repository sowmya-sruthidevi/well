import React from "react";

const ParticipantCard = ({ name, isUser, videoRef, active }) => {

  return (

    <div className={`bg-gray-800 p-4 rounded-xl text-center transition-all
    ${active ? "bot-glow" : ""}`}>

      <h3 className="mb-2 font-semibold">{name}</h3>

      {isUser ? (

        <video
          ref={videoRef}
          autoPlay
          muted
          className="rounded-lg w-full"
        />

      ) : (

        <div className="flex justify-center">

          {/* BOT AVATAR */}
          <div className="relative w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">

            {/* EYES */}
            <div className="absolute top-4 flex gap-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>

            {/* MOUTH */}
            <div
              className={`absolute bottom-3 w-6 h-2 bg-black rounded-full
              ${active ? "talking-mouth" : ""}`}
            ></div>

          </div>

        </div>

      )}

    </div>

  );

};

export default ParticipantCard;