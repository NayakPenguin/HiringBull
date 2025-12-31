import 'dotenv/config';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandlers.js";
import { initClerk } from "./middlewares/auth.js";
import { defaultLimiter } from "./middlewares/rateLimiter.js";
import { validateEnv } from "./utils/validateEnv.js";

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 4000;
// Health check root - moved to top to ensure availability even if config is incomplete
app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Hi guys , HiringBull server is running" });
});

app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for public access
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


// Rate limiting
// app.use(defaultLimiter);
app.set("trust proxy", 1);

// Clerk authentication (populates req.auth)
app.use(initClerk);

// Routes
app.use("/api", routes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HiringBull server running on port ${PORT}`);
  console.log(`Server accessible at http://0.0.0.0:${PORT}`);
});
