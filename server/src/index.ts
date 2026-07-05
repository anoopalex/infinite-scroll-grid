import cors from "cors";
import express from "express";
import { applySchema, isSeeded } from "./db/client";
import { usersRouter } from "./routes/users";

if (!isSeeded()) {
  console.log("Database is empty, applying schema. Run `npm run seed` to load data.");
  applySchema();
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", usersRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Presight API listening on port ${PORT}`);
});
