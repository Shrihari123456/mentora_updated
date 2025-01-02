import express from "express";
import * as mongoose from "mongoose";
import cors from "cors";
import { setupSwaggerDocs } from "./utils/swagger";
import studRouter from "./routes/student";
import mentRouter from "./routes/mentor";
import morgan from "morgan";

const app = express();

app.use(express.json());

const logger = morgan("dev");
app.use(logger);
//allow cors
app.use(cors());
const port = 8080;
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/test"
);

console.log("Connected to MongoDB...");
setupSwaggerDocs(app);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(studRouter);
app.use(mentRouter);

app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
