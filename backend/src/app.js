import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import chatRoutes from "./routes/chat.js";
import chatHistoryRoutes from "./routes/chatHistoryRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { verifyAuth } from "./middlewares/verifyAuth.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/chat", verifyAuth, chatRoutes);
app.use("/api/chat/history", verifyAuth, chatHistoryRoutes);
app.use("/api", router);
app.use(notFound);
app.use(errorHandler);

export default app;
