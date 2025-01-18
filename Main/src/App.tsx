import { useState, useEffect } from "react";
import io from "socket.io-client";
import stepData from "./data/values.json";
import MultiplierProgressBar from '@/components/ui/multiplier-progress-bar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "./components/ui/sidebar";

interface Scale {
  name: string;
  steps: number;
}

interface Milestone {
  name: string;
  steps: number;
}

const scaleMilestoneMap: { [key: string]: string[] } = {
  "fridge": ["Burger", "Oven"],
  "block": ["Toronto", "LA"],
  "everest": ["Empire State", "CN Tower", "Burj Khalifa"],
  "moon": ["Mercury", "Earth"],
  "edge of the observable universe": ["Solar System Edge"]
};

export default function App() {
  const [steps, setSteps] = useState(30001);
  const [isConnected, setIsConnected] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("WebSocket connected successfully!");
      setIsConnected(true);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setIsConnected(false);
    });

    socket.on("disconnect", () => {
      console.warn("WebSocket disconnected.");
      setIsConnected(false);
    });

    socket.on("updateSteps", (newSteps: number) => {
      console.log("Received updated steps:", newSteps);
      setSteps(newSteps);
    });

    return () => {
      console.log("Cleaning up WebSocket connection...");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("updateSteps");
      socket.disconnect();
    };
  }, []);

  const currentScale = stepData.scales[scale - 1];

  const getFilteredMilestones = () => {
    const allowedMilestones = scaleMilestoneMap[currentScale.name] || [];
    return stepData.milestones.filter(milestone => 
      allowedMilestones.includes(milestone.name)
    );
  };

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
        <SidebarTrigger className="p-4 rounded-full shadow-lg fixed top-4 left-4 z-50" />
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 w-screen h-screen flex justify-center items-center fixed top-0 right-0 z-10">
        <div className="bg-white w-full max-w-md h-screen p-6 rounded-3xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">Hi User! 👋</h1>
          </div>

          {/* Tabs */}
          <div className="flex justify-around mb-2">
            <button className="text-orange-500 font-bold">Day</button>
            <button className="text-gray-500">Week</button>
            <button className="text-gray-500">Month</button>
            <button className="text-gray-500">Year</button>
          </div>

          {/* Steps Section */}
          <div className="text-center mb-4">
            <h2 className="text-5xl font-bold">{steps.toLocaleString()}</h2>
            <p className="text-lg">steps</p>
            <p className="text-sm text-gray-600 mt-1">
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
          <div className="mb-4">
            <input
              type="range"
              className="w-full"
              min="1"
              max={stepData.scales.length}
              step="1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />
            <div className="flex justify-between text-sm mt-1">
              <span>Small scale</span>
              <span>Large scale</span>
            </div>
            <p className="text-center text-lg mt-2">
              Selected Scale:{" "}
              <span className="font-bold">{currentScale.name}</span>
            </p>
          </div>

          {/* Milestones */}
          <div className="flex-grow">
            {getFilteredMilestones().map((milestone) => (
              <MultiplierProgressBar
                key={milestone.name}
                milestone={milestone}
                steps={steps}
              />
            ))}
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-around border-t pt-4">
            <button className="text-orange-500 font-bold">Summary</button>
            <button className="text-gray-500">Leaderboards</button>
            <button className="text-gray-500">Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}