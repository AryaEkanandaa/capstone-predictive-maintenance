import { useEffect } from "react";
import { socket } from "../lib/socket";

export default function usePredictionHistoryFeed(handler) {

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const listener = (payload) => {
      console.log("REALTIME RECEIVED:", payload);
      handler(payload);
    };

    socket.on("prediction:update", listener);
    socket.on("prediction_update", listener);

    return () => {
      socket.off("prediction:update", listener);
      socket.off("prediction_update", listener);
    };
  }, [handler]);
}
