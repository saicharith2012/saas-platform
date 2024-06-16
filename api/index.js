import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {addInitialData} from "./initialData.js";

dotenv.config({
  path: ".env",
});

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Error", err);
  });

// addInitialData()