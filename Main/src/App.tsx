import { useState, useEffect } from "react";
import io from "socket.io-client";
import stepData from "./data/values.json"; // Import JSON file
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "./components/ui/sidebar";

export default function App() {
  const [steps, setSteps] = useState(1000000);
  const [isConnected, setIsConnected] = useState(false);
  const [scale, setScale] = useState(1); // State to manage the slider value (1 to 5)

  useEffect(() => {
    // Initialize the socket connection
    const socket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
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

  // Get the current scale object from the JSON file
  const currentScale = stepData.scales[scale - 1];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div>
        <Sidebar className="z-20">
          <SidebarHeader />
          <SidebarContent>
            <SidebarGroup />
            <SidebarGroup />
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        <SidebarTrigger className="p-4  rounded-full shadow-lg fixed top-4 left-4 z-50"></SidebarTrigger>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 w-screen h-screen flex justify-center items-center fixed top-0 right-0 z-10">
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
              You are{" "}
              <span className="font-bold">
                {Math.max(0, currentScale.steps - steps).toLocaleString()}
              </span>{" "}
              steps away from the{" "}
              <span className="text-orange-500 font-bold">
                {currentScale.name}
              </span>
              .
            </p>
          </div>

          {/* Slider */}
          <div className="my-4">
            <input
              type="range"
              className="w-full"
              min="1"
              max={stepData.scales.length}
              step="1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))} // Update scale value
            />
            <div className="flex justify-between text-sm mt-2">
              <span>Small scale</span>
              <span>Large scale</span>
            </div>
            {/* Display the scale value */}
            <p className="text-center text-lg mt-4">
              Selected Scale:{" "}
              <span className="font-bold">{currentScale.name}</span>
            </p>
          </div>

          {/* Milestones */}
          <div className="my-6">
            {stepData.milestones.map((milestone) => {
              const progress = Math.min(
                (steps / milestone.steps) * 100,
                100
              ).toFixed(2); // Calculate progress percentage
              return (
                <div key={milestone.name} className="my-4">
                  <p className="text-center font-bold mb-2">{milestone.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-orange-500 h-4 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center mt-2">
                    {progress}% complete
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-around border-t pt-4 mt-auto">
            <button className="text-orange-500 font-bold">Summary</button>
            <button>Leaderboards</button>
            <button>Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
