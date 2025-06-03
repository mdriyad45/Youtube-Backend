import dotenv from "dotenv";
import connectDb from "./db/index.js";
import app from './app.js'

dotenv.config({ path: "./.env" });

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Field !!! ", err.message);
  });
