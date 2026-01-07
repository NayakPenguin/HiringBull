import 'dotenv/config';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandlers.js";
import { initClerk } from "./middlewares/auth.js";
import { defaultLimiter } from "./middlewares/rateLimiter.js";
import { validateEnv } from "./utils/validateEnv.js";
import { swaggerSpec } from "./config/swagger.js";

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     description: Root endpoint to verify API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "Testing backend auto deployment! - 2 Jan 2026 - 7:35AM"
 *     x-code-samples:
 *       - lang: curl
 *         source: curl -X GET http://localhost:4000/
 */
app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Testing backend auto deployment! - 2 Jan 2026 - 7:35AM" });
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

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'HiringBull API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Swagger JSON spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use("/api", routes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HiringBull server running on port ${PORT}`);
  console.log(`Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`Swagger documentation available at http://0.0.0.0:${PORT}/api-docs`);
});
