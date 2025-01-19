import { useState, useEffect } from "react";
import io from "socket.io-client";
import stepData from "./data/values.json";
import PlusIcon from "./assets/plus.svg"; // Replace with the path to your plus icon
import Share from "./assets/upload.svg"; // Replace with the path to your share icon
import MultiplierProgressBar from "@/components/ui/multiplier-progress-bar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareFromSquare } from "@fortawesome/free-solid-svg-icons";
import BarChartIcon from "./assets/bar-chart.svg";
import ListIcon from "./assets/list.svg";
import SettingsIcon from "./assets/settings.svg";
import Groq from "groq-sdk";
import ReactMarkdown from "react-markdown";



interface Scale {
  name: string;
  steps: number;
}

interface Milestone {
  name: string;
  steps: number;
}

interface ScaleMilestoneMap {
  [key: string]: {
    distanceMilestones: string[];
    foodMilestones: string[];
  };
}

const scaleMilestoneMap: ScaleMilestoneMap = {
  Fridge: {
    distanceMilestones: [],
    foodMilestones: ["Celery Stick", "Carrot"],
  },
  Block: {
    distanceMilestones: ["Toronto", "Los Angeles"],
    foodMilestones: ["Apple", "Slice of Bread"],
  },
  Everest: {
    distanceMilestones: ["Empire State", "CN Tower", "Burj Khalifa"],
    foodMilestones: ["Cookie", "Donut", "Slice of Pizza"],
  },
  Moon: {
    distanceMilestones: ["Mercury", "Earth"],
    foodMilestones: ["Big Mac", "Large Fries", "Ice Cream Sundae"],
  },
  "Edge of the observable universe": {
    distanceMilestones: ["Solar System Edge"],
    foodMilestones: ["Wedding Cake", "Earth's Largest Burrito", "Uranium"],
  },
};

export default function App() {
  console.log("Process: ", import.meta.env.VITE_SOME_KEY);
  const groq = new Groq({ apiKey: "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",  dangerouslyAllowBrowser: true });
  const [steps, setSteps] = useState(300);
  const [isConnected, setIsConnected] = useState(false);
  const [scale, setScale] = useState(1);
  const [buttonSelect, setButtonSelect] = useState("Day");
  const [makePostState, setMakePostState] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<"distance" | "food">(
    "distance"
  );
  const [PostText, SetPostText] = useState('');

  useEffect(() => {
    const socket = io("https://step-2-it-production.up.railway.app/", {
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
    const allowedMilestones = scaleMilestoneMap[currentScale.name] || {
      distanceMilestones: [],
      foodMilestones: [],
    };
    const milestones =
      comparisonMode === "distance"
        ? stepData.distanceMilestones
        : stepData.foodMilestones;
    return milestones.filter((milestone) =>
      allowedMilestones[
        (comparisonMode + "Milestones") as
          | "distanceMilestones"
          | "foodMilestones"
      ].includes(milestone.name)
    );
  };

  async function fetchChatCompletion(steps: number, stepData: typeof stepData) {
    try {
      // Select a random milestone from the stepData (distance or food)
      const milestones = [
        ...stepData.distanceMilestones,
        ...stepData.foodMilestones,
      ];
      const randomMilestone =
        milestones[Math.floor(Math.random() * milestones.length)];
  
        const prompt = `
        I have walked or run a total of ${steps} steps, and I'm feeling proud of this accomplishment! Based on my milestone data:
        - Milestone: "${randomMilestone.name}" (${randomMilestone.steps} steps)
        
        Write a Twitter-style post in my voice, celebrating this milestone as if I'm the one writing it. Use emojis to make it lively and exciting, and make the tone personal, encouraging, and enthusiastic. The post should sound like something I’d share to inspire others, and it can be longer than 280 characters if needed, but still concise enough to keep it engaging. Focus on self-expression and pride in this achievement.
      `;
      
  
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
      });
  
      const generatedText =
        chatCompletion.choices[0]?.message?.content || "No content generated.";
  
      return generatedText;
    } catch (error) {
      console.error("Error fetching chat completion:", error);
      throw error;
    }
  }

  const handleMakePost = async () => {
    if (!makePostState) {
      try {
        const generatedPost = await fetchChatCompletion(steps, stepData);
        SetPostText(generatedPost);
      } catch (error) {
        SetPostText("Failed to generate a post. Please try again.");
      }
    }
    setMakePostState(!makePostState); // Toggle the "Make Post" state
  };
  


  return (
    <div className="flex relative">
      {/* Sidebar */}
      <div>
        <Sidebar className="z-20">
          <SidebarHeader />
          <SidebarContent>
            <SidebarGroup />
            <button
              className="flex items-center space-x-2 bg-orange-500 text-white py-2 mt-5 ml-4 px-4 rounded-full shadow-md transition-transform hover:scale-105 w-3/4"
              onClick={handleMakePost}
            >
              <img src={PlusIcon} alt="Plus Icon" className="w-5 h-5" />
              <span>Make Post</span>
            </button>
            <SidebarGroup />
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        <SidebarTrigger className="p-4 rounded-full shadow-lg fixed top-4 left-4 z-50" />
      </div>

      {/* Main Content */}
      <div className="w-screen h-screen flex justify-center items-center fixed top-0 right-0 z-10">
        <div className="bg-[#F9f9f9] w-full max-w-md h-screen p-6 rounded-3xl shadow-xl flex flex-col relative">
          {/* Header */}
          <div className="relative mb-4">
            {/* Share Icon */}
            {/* Comparison Mode Toggle */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              <button
                className={`p-3 rounded-full shadow-md transition-all ${
                  comparisonMode === "distance"
                    ? "bg-orange-500 text-white scale-105"
                    : "bg-gray-200 text-gray-600"
                }`}
                onClick={() => setComparisonMode("distance")}
              >
                🏃
              </button>
              <button
                className={`p-3 rounded-full shadow-md transition-all ${
                  comparisonMode === "food"
                    ? "bg-orange-500 text-white scale-105"
                    : "bg-gray-200 text-gray-600"
                }`}
                onClick={() => setComparisonMode("food")}
              >
                🍔
              </button>
            </div>
            <h1 className="text-3xl font-bold">Hi Alex! 👋</h1>
          </div>

          {/* White Background Section */}
          <div className="bg-white rounded-3xl p-6 mb-4">
            {/* Tabs */}
            <div className="flex justify-around mb-10">
              {["Day", "Week", "Month", "Year"].map((tab) => (
                <button
                  key={tab}
                  className={`font-bold ${
                    buttonSelect === tab
                      ? "text-orange-500 font-bold"
                      : "text-gray-500 font-normal"
                  }`}
                  onClick={() => setButtonSelect(tab)} // Highlight selected button
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Steps Section */}
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-6">
                {steps.toLocaleString()}
              </h2>
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
              <span className="text-xs text-gray-500">Small scale</span>
              <span className="text-xs text-gray-500">Large scale</span>
            </div>
          </div>

          {/* Milestones */}
          <div className="flex-grow">
            {getFilteredMilestones().map((milestone: Milestone) => (
              <MultiplierProgressBar
                key={milestone.name}
                milestone={milestone}
                steps={steps}
              />
            ))}
          </div>

          {/* Footer Navigation */}
          <div className="flex text-sm justify-around p-4 rounded-full bg-white w-full">
            <button className="text-orange-500 font-bold flex flex-col items-center justify-center">
              <img src={BarChartIcon} className="mb-1" />
              Summary
            </button>
            <button
              className="text-gray-500 flex flex-col items-center justify-center"
              onClick={handleMakePost}
            >
              <img src={Share} alt="Share Icon" className="mb-1" />
              Share
            </button>
            <button className="text-gray-500 flex flex-col items-center justify-center">
              <img src={SettingsIcon} className="mb-1" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Make Post Overlay */}
      {makePostState && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleMakePost}
        >
          <div
            className="bg-white w-3/4 h-3/4 rounded-lg shadow-xl p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent click event from bubbling up
          >
            <h2 className="text-2xl font-bold mb-4">Make a Post</h2>

            {/* Generated Text Section */}
            <div className="flex-1 bg-gray-100 p-4 rounded-md overflow-y-auto">
            <ReactMarkdown className="prose text-gray-700">
              {PostText || "Generating your post..."}
            </ReactMarkdown>

            </div>

            {/* Footer or Additional Content */}
            <div className="mt-4">
              <button
                className="bg-orange-500 text-white py-2 px-4 rounded-md shadow-md hover:scale-105 transition-transform"
                onClick={() => alert("Action on generated text!")}
              >
                Submit Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
