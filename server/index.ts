import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createOrder, verifyPayment, getPaymentStatus, handleWebhook } from "./routes/payments";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Payment routes
  app.post("/api/payments/create-order", createOrder);
  app.post("/api/payments/verify", verifyPayment);
  app.get("/api/payments/:payment_id/status", getPaymentStatus);
  app.post("/api/payments/webhook", handleWebhook);

  return app;
}
