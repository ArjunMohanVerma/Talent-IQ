import express from "express";
import path from "path";
import cors from "cors";

import {ENV} from "./lib/env.js";
import { connectDB } from "./lib/db.js";

const app = express();

const _dirname = path.resolve();

app.use(express.json());
app.use(cors({
    credentials:true,
    origin:ENV.CLIENT_URL
}));

app.get("/", (req,res)=>{
    res.send("Welcome to home page")
})

if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(_dirname, "../frontend/dist")));
    app.get("/{*any}", (req,res)=>{
        res.sendFile(path.join(_dirname,"../frontend","dist","index.html"));
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