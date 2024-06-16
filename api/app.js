import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// json request body parser
app.use(
  express.json({
    limit: "16kb",
  })
);

// url-encoded request body parsers
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"))

app.use(cookieParser())

// routes
import planRouter from "./routes/plan.routes.js"
import userRouter from "./routes/user.routes.js"
import organizationRouter from "./routes/organization.routes.js"

app.use("/api/plans", planRouter)
app.use("/api/users", userRouter)
app.use("/api/organizations", organizationRouter)


export default app;
