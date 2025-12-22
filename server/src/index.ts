import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentora';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB...'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Import routes
import chatRoutes from './routes/chat';
import studRouter from './routes/student';  // Your existing file
import mentRouter from './routes/mentor';   // Your existing file
import emailRoutes from './routes/email';   // Add this import
import markrouter from './routes/mark';
import adminRouter from "./routes/admin";
import verificationRouter from "./routes/verification";
import chatbotRouter from "./routes/chatbot"
import studentReportRouter from "./routes/studentReport"

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mentora API Server',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes under /api prefix
app.use('/api', studRouter);      // Routes: /api/students/login, /api/students, etc.
app.use('/api', mentRouter);      // Routes: /api/mentors/login, /api/mentors, etc.
app.use('/api/chat', chatRoutes); // Routes: /api/chat, /api/chat/read, etc.
app.use('/api/email', emailRoutes); // Add this line - Routes: /api/email/send, /api/email/inbox, etc.
app.use('/api/marks',markrouter)
app.use("/api/admin", adminRouter);
app.use("/api/verification", verificationRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/report',studentReportRouter)
// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log('\n📍 Available Routes:');
  console.log('  POST /api/students/login');
  console.log('  POST /api/mentors/login');
  console.log('  GET  /api/students');
  console.log('  GET  /api/mentors');
  console.log('  GET  /api/chat');
  console.log('  POST /api/chat');
  console.log('  PUT  /api/chat/read');
  console.log('  POST /api/email/send');     // Added
  console.log('  GET  /api/email/inbox');    // Added
  console.log('  GET  /api/email/sent');     // Added
  console.log('  GET  /api/email/stats');    // Added
  console.log('  GET  /api/email/:id');      // Added
  console.log('  PUT  /api/email/:id/star'); // Added
  console.log('  PUT  /api/email/:id/labels'); // Added
  console.log('  DELETE /api/email/:id');    // Added
  console.log('');
});