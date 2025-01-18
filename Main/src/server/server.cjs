const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let currentSteps = 0;

app.use(cors());
app.use(express.json());


// WebSocket Connection
io.on("connection", (socket) => {
    console.log("Client connected");
    socket.emit("updateSteps", currentSteps); // Send initial step count
  
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  
// HTTP POST Endpoint
app.post("/steps", (req, res) => {
  console.log("request recieved");
  const { steps } = req.body;
  console.log(steps);
  if (typeof steps === "number") {
    currentSteps = steps;
    io.emit("updateSteps", currentSteps); // Broadcast to WebSocket clients
    res.status(200).json({ message: "Steps updated", steps: currentSteps });
  } else {
    res.status(400).json({ error: "Invalid step data papa" });
  }
});



  // Start Server
  server.listen(3001, "0.0.0.0", () => {
    console.log("Server running on http://100.66.94.140:3001");
  });
  
