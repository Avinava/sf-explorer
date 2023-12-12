import { Request, Response, Router } from "express";
import generate from "../../../services/generate";
import { rateLimit } from "express-rate-limit";

const router = Router();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests
const RATE_LIMIT_MESSAGE = "Too many requests from this IP, please try again after a minute";

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: MAX_REQUESTS_PER_WINDOW,
  message: RATE_LIMIT_MESSAGE,
});

router.use(limiter);

async function generateResponse(req: Request, res: Response) {
  try {
    const { query } = req.query;
    const generateResponse = await generate.run(query as string);
    return res.status(200).send({
      openai: {
        references: generateResponse.openai?.sourceDocuments,
        answer: generateResponse.openai?.text,
      },
    });
  } catch (error: any) {
    console.log("error-happened:" , error);
    return res.status(500).send({
      error: error.message,
    });
  }
}
router.get("/generate", generateResponse);
export default router;
