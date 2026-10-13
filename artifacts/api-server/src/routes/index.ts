import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clinicRouter from "./clinic";
import sarvamRouter from "./sarvam";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clinicRouter);
router.use(sarvamRouter);

export default router;
