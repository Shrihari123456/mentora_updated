import express from "express";
import * as mongoose from "mongoose";
import { setupSwaggerDocs } from "./utils/swagger";
import router from "./routes/student";
const app = express();
const port = 8080;

await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/test"
);

console.log("Connected to MongoDB...");
setupSwaggerDocs(app);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(router);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
