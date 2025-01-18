import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://100.66.94.140:3001'); // Replace with your server's IP

export default function App() {
    const [steps, setSteps] = useState(0);

    useEffect(() => {
        // Listen for step updates
        socket.on('updateSteps', (newSteps) => {
          console.log("Received updated steps:", newSteps); // Debug log
          setSteps(newSteps);
        });

        return () => {
            socket.disconnect(); // Cleanup
        };
    }, []);

    return (
        <div>
            <h1>Steps Tracker</h1>
            <p>Steps Today: {steps}</p>
        </div>
    );
}
