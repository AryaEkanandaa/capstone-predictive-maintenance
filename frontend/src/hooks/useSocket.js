// src/hooks/useSocket.js
import { useEffect } from "react";
import { socket } from "../lib/socket";

export default function useSocket(eventHandlers = {}) {
    useEffect(() => {

        const token = localStorage.getItem("accessToken");
        if (token) socket.auth = { token };

        // connect socket if not yet connected
        if (!socket.connected) socket.connect();

        // Core events
        if (eventHandlers.connect)
            socket.on("connect", eventHandlers.connect);

        if (eventHandlers.disconnect)
            socket.on("disconnect", eventHandlers.disconnect);

        // 🔥 Real-time sensor
        if (eventHandlers["sensor:update"])
            socket.on("sensor:update", eventHandlers["sensor:update"]);

        // 🔥 Real-time AI prediction
        if (eventHandlers["prediction:update"])
            socket.on("prediction:update", eventHandlers["prediction:update"]);

        return () => {
            if (eventHandlers.connect) socket.off("connect", eventHandlers.connect);
            if (eventHandlers.disconnect) socket.off("disconnect", eventHandlers.disconnect);
            if (eventHandlers["sensor:update"]) socket.off("sensor:update", eventHandlers["sensor:update"]);
            if (eventHandlers["prediction:update"]) socket.off("prediction:update", eventHandlers["prediction:update"]);
        };
    }, []);
}
