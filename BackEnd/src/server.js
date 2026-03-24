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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST"],
    credentials: true
  }
});
setupSocket(io);

app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true 
}))


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
app.use("/problem", problemRouter)
app.use("/submission",submitRouter);
app.use('/ai',AIRouter);
app.use("/video" , videoRouter)



const serverConnect = async () => {
  try {
    await Promise.all([main(), redisClient.connect(), initEmbedder()]);
    console.log("Connected to db successfully.");
    
    // Start matched worker
    initMatchmaker(io);

    server.listen(process.env.PORT, () => {
      console.log(`Listening at Port ${process.env.PORT}...`)
    })
  } catch (err) {
    console.log(err)
  }
}

serverConnect()

