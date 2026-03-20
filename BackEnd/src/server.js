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

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))


app.use(express.json())
app.use(cookieParser())



app.use("/auth", authRouter)
app.use("/problem", problemRouter)
app.use("/submission",submitRouter);
app.use('/ai',AIRouter);
app.use("/video" , videoRouter)





const serverConnect = async () => {
  try {
    await Promise.all([main(), redisClient.connect()])
    console.log("Connected to db successfully.")

    app.listen(process.env.PORT, () => {
      console.log(`Listening at Port ${process.env.PORT}...`)
    })
  } catch (err) {
    console.log(err)
  }
}

serverConnect()

