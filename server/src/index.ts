import express from "express";
import * as mongoose from "mongoose";
import cors from "cors";
import { setupSwaggerDocs } from "./utils/swagger";
import studRouter from "./routes/student";
import mentRouter from "./routes/mentor";
import morgan from "morgan";
import adminRouter from "./routes/admin";
import markRouter from "./routes/mark";
import verificationRouter from "./routes/verification";
import eventRoutes from "./routes/event";
import appointmentRouter from "./routes/appointment";
import studmentRouter from "./routes/query";
// import adminRouter from "./routes/admin";
const app = express();

app.use(express.json());

const logger = morgan("dev");
app.use(logger);
//allow cors
app.use(cors());
const port =8000;
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
app.use(adminRouter);
app.use(markRouter);
app.use(eventRoutes);
app.use(adminRouter)
app.use(verificationRouter);
app.use("/api/students", studRouter);
 app.use("/api/mentors", mentRouter);
 app.use("/api/admin", adminRouter);
app.use("/api/marks", markRouter);
app.use("/api/verification", verificationRouter);
app.use("/api/events", eventRoutes);
app.use("/api/appointments", appointmentRouter);
app.use("/api/query", studmentRouter);
app.use("/api/admin", adminRouter);
app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
