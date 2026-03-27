
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import { redisClient } from "../config/redis.js"



export const userMiddleware = async (req, res , next) =>{

     try {
          const {token} = req.cookies;
          if(!token)
               throw new Error("Token is not present")
          const payload = jwt.verify(token , process.env.JWT_SECRET)
          if(!payload._id)
               throw new Error("Invalid Token")

          const result = await User.findById(payload._id)
          if(!result)
               throw new Error("User not found")

          if (redisClient.isReady) {
               const isBlocked = await redisClient.exists(`token:${token}`)
               if(isBlocked)
                    throw new Error("Invalid Token")
          }

          req.result = result
          next()


     }catch(error){
          console.log("Error is : " , error);
          res.status(401).send("Error is : " + error)
     }

     
     
}

