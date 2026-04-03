import express from "express";
import 'dotenv/config';
import { authRouter  } from "./routes/userAuth.js";
import submitRouter from "./routes/submit.js";
import  problemRouter  from "./routes/problemCreator.js";
import cookieParser from "cookie-parser";
import cors from "cors"
//dotenv.config();

import main from "./config/db.js"
import { redisClient } from "./config/redis.js";
import AIRouter from "./routes/aiChatting.js";
import { videoRouter } from "./routes/videoCreator.js";
import { initEmbedder } from "./utils/embedder.js";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socketManager.js";
import { userProfileRouter } from "./routes/userProfile.js";
import { matchRouter } from "./routes/match.js";
import { initMatchmaker } from "./workers/matchmaker.js";
import { contentRouter } from "./routes/content.js";

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;
app.set("trust proxy", 1);
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

const corsOriginHandler = (origin, callback) => {
  if (isOriginAllowed(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ["GET", "POST"],
    credentials: true
  }
});
setupSocket(io);

app.use(cors({
    origin: corsOriginHandler,
    credentials: true 
}))


app.use("/video/webhook", express.raw({ type: "application/json" }));
app.use(express.json())
app.use(cookieParser())

// Expose io to req BEFORE routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", authRouter)
app.use("/api/user", userProfileRouter)
app.use("/api/match", matchRouter)
app.use("/api/content", contentRouter)
app.use("/problem", problemRouter)
app.use("/submission",submitRouter);
app.use('/ai',AIRouter);
app.use("/video" , videoRouter)
app.get("/ping", (req, res) => {
  res.status(200).send("Server is awake");
});



const serverConnect = async () => {
  try {
    await Promise.all([main(), initEmbedder()]);
    console.log("Connected to db successfully.");

    redisClient.connect()
      .then(() => {
        console.log("Connected to redis successfully.");
      })
      .catch((error) => {
        console.error("Redis connection unavailable at startup:", error?.code || error?.message || error);
      });
    
    // Start matched worker
    initMatchmaker(io);

    server.listen(PORT, () => {
      console.log(`Listening at Port ${PORT}...`)
    })
  } catch (err) {
    console.log(err)
  }
}

serverConnect()
