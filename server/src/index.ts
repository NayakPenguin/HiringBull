import "dotenv/config";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandlers.js";
import { validateEnv } from "./utils/validateEnv.js";
import { swaggerSpec } from "./config/swagger.js";
import "./types/index.js"; // Load Express augmentation

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/", (req: Request, res: Response) => {
  res.send({
    status: "ok",
    message: "Welcome to HiringBull API! - last updated 1-02-2026",
  });
});

app.use(helmet());
app.use(
  cors({
    origin: "*", // Allow all origins for public access
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting
// app.use(defaultLimiter);
app.set("trust proxy", 1);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "HiringBull API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  }),
);

app.use("/api", routes);
app.use("/api/v1", routes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HiringBull API listening on port ${PORT}`);
});

export default app;
