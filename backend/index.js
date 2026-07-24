import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import passwordResetRoute from "./routes/passwordReset.route.js"; 
import storyRoute from "./routes/story.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

// APIs
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/user", passwordResetRoute); 
app.use("/api/v1/story", storyRoute);

// Frontend (commented out for development)
// app.use(express.static(path.join(__dirname, "frontend", "dist")));
// app.use((req, res) => {
//   res.sendFile(
//     path.resolve(__dirname, "frontend", "dist", "index.html")
//   );
// });

// Server
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});