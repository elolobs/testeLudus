import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import { authRouter } from "./routes/AuthRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import recursoRoutes from "./routes/recursoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto base",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRouter);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", recursoRoutes);

app.use(errorHandler);