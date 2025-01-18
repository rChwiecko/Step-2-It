import { useState, useEffect } from "react";
import io from "socket.io-client";
import './data/values.json';

export default function App() {
  const [steps, setSteps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket connection
    const socket = io("http://localhost:3001", {
      reconnection: true, // Enable automatic reconnections
      reconnectionAttempts: Infinity, // Retry forever
      reconnectionDelay: 1000, // Delay between attempts (in ms)
    });

    // Connection established
    socket.on("connect", () => {
      console.log("WebSocket connected successfully!");
      setIsConnected(true);
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setIsConnected(false);
    });

    // Connection lost
    socket.on("disconnect", () => {
      console.warn("WebSocket disconnected.");
      setIsConnected(false);
    });

    // Listen for step updates
    socket.on("updateSteps", (newSteps) => {
      console.log("Received updated steps:", newSteps);
      setSteps(newSteps);
    });

    // Cleanup on component unmount
    return () => {
      console.log("Cleaning up WebSocket connection...");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("updateSteps");
      socket.disconnect(); // Close the connection
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="bg-gray-100 w-screen h-screen flex justify-center items-center">
      {/* Outer Container */}
      <div className="bg-white w-full max-w-md h-[90%] md:h-[80%] p-6 rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Hi User! 👋</h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-around mb-4">
          <button className="text-orange-500 font-bold">Day</button>
          <button className="text-gray-500">Week</button>
          <button className="text-gray-500">Month</button>
          <button className="text-gray-500">Year</button>
        </div>

        {/* Steps Section */}
        <div className="text-center my-6">
          <h2 className="text-5xl font-bold">{steps}</h2>
          <p className="text-lg">steps</p>
          <p className="text-sm text-gray-600 mt-2">
            You are <span className="font-bold">23402938409234823420934</span>{" "}
            steps away from the{" "}
            <span className="text-orange-500 font-bold">Moon</span>.
          </p>
        </div>

        {/* Slider */}
        <div className="my-4">
          <input type="range" className="w-full" />
          <div className="flex justify-between text-sm mt-2">
            <span>Small scale</span>
            <span>Large scale</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm text-center">
            <p className="font-bold">Mercury</p>
            <span role="img" aria-label="planet">
              🪐
            </span>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm text-center">
            <p className="font-bold">Earth</p>
            <span role="img" aria-label="planet">
              🌍
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-around border-t pt-4 mt-auto">
          <button className="text-orange-500 font-bold">Summary</button>
          <button>Leaderboards</button>
          <button>Settings</button>
        </div>
      </div>
    </div>
  );
}
