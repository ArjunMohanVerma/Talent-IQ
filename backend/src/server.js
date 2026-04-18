import express from "express";
import path from "path";
import cors from "cors";
import { serve, functions } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import {ENV} from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

const app = express();

const __dirname = path.resolve();

app.use(express.json());
// app.use(clerkMiddleware()); 
app.use(cors({
    credentials:true,
    origin:ENV.CLIENT_URL
}));

app.use("/api/inngest", serve({ client: inngest, functions,signingKey: ENV.INNGEST_SIGNING_KEY}));

if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("/{*any}", (req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();