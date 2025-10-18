// Purpose: read env, start the HTTP server.
import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { cs } from "zod/v4/locales";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`API RUnning on http://localhost:${PORT}`);
});
