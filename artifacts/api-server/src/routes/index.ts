import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import verificationRouter from "./verification.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/verify", verificationRouter);

export default router;
