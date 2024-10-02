import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

//import routes here
import userRoutes from "./routes/user.route.js";
import profRoutes from "./routes/prof.route.js";

//routes use declaration
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/prof", profRoutes);

export { app };
