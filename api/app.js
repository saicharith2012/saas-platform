import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// cors
app.use(
  cors({
    origin: "http://localhost:3000",  // <-- location of the react app
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// json request body parser
app.use((req, res, next) => {
  if (req.originalUrl.includes("/payments/webhook")) {
    next();
  } else {
    express.json({
      limit: "16kb",
    })(req, res, next);
  }
});

// url-encoded request body parsers
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"))

app.use(cookieParser())

// routes
import planRouter from "./routes/plan.routes.js"
import userRouter from "./routes/user.routes.js"
import organizationRouter from "./routes/organization.routes.js"
import paymentRouter from "./routes/payment.routes.js"
import productRouter from "./routes/product.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"

app.use("/api/plans", planRouter)
app.use("/api/users", userRouter)
app.use("/api/organizations", organizationRouter)
app.use("/api/payments", paymentRouter)
app.use("/api/products", productRouter)
app.use("/api/subscriptions", subscriptionRouter)


export default app;

