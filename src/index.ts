import express, { type Request, type Response } from "express";

// import middleware
import morgan from "morgan";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.ts";
import errorHandler from "./middlewares/invalidJsonMiddleware.ts";

// import routers
import studentsRouterV1 from "./routes/studentsRoutes_v1.ts";
import studentsRouterV2 from "./routes/studentsRoutes_v2.ts";

const app = express();
const port = 3000;

// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(errorHandler);

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// use routers
app.use("/api/v1", studentsRouterV1);
app.use("/api/v2", studentsRouterV2);

app.use(notFoundMiddleware);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
