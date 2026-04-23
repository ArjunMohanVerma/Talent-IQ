import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";


const app = express();

const __dirname = path.resolve();


app.use(
  cors({
    credentials: true,
    origin:[ ENV.CLIENT_URL,
      "https://talent-iq-1-exy7.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],

  }),
);

app.options(/.*/, cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(
  "/api/inngest",
  serve({ client: inngest, functions, signingKey: ENV.INNGEST_SIGNING_KEY }),
);
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});


//Piston API not free now
// app.post("/api/execute", async (req, res) => {
//   try {
//     const response = await fetch("https://emkc.org/api/v2/piston/execute", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(req.body),
//     });

//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error("Execution error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });





//using Judge0
app.post("/api/execute", async (req, res) => {
  try {
    const { language, code } = req.body;

    const languageMap = {
      javascript: 63,
      python: 71,
      java: 62,
    };

    const language_id = languageMap[language];

    if (!language_id) {
      return res.status(400).json({
        error: "Unsupported language",
      });
    }

    const submitResponse = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id,
          source_code: code,
        }),
      }
    );

    const data = await submitResponse.json();

    // 🔥 IMPORTANT: normalize all possible outputs
    const stdout = data.stdout || "";
    const stderr = data.stderr || "";
    const compile_output = data.compile_output || "";

    res.json({
      run: {
        stdout,
        stderr,
        compile_output,
        status: data.status?.description || "",
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Execution failed",
    });
  }
});


if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  // app.get("/{*any}", (req,res)=>{
  //     res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
  // });
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log("Server is running on port:", ENV.PORT),
    );
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
