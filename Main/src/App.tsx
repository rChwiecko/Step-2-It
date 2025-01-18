import { useState, useEffect } from "react";
import io from "socket.io-client";

export default function App() {
  const [steps, setSteps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket connection
    const socket = io("http://localhost:3001" , {
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
    <div>
      <h1>Steps Tracker</h1>
      <p>Steps Today: {steps}</p>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}
