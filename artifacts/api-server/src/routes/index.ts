import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import verificationRouter from "./verification.js";
import startupsRouter from "./startups.js";
import marketingRouter from "./marketing.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/verify", verificationRouter);
router.use("/startups", startupsRouter);
router.use("/marketing", marketingRouter);

export default router;
