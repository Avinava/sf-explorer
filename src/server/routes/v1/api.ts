"use strict";
import { Request, Response, Router } from "express";
import generate from "../../../services/generate";
import { readFileSync } from "fs";

/**
 * List of API examples.
 * @route GET /api
 */

const router = Router();
console.log("#######");

router.get("/hello", (req: Request, res: Response) => {
  return res.status(200).send({
    message: "Hello World!",
  });
})


router.get("/generate", async (req: Request, res: Response) => {
  const { query } = req.query;
  const generateResponse = await generate.run(query as string);

  const openaiResponses = [];

  if(generateResponse.openai?.sourceDocuments){
    for (const match of generateResponse.openai.sourceDocuments) {
      openaiResponses.push({
        ...match,
        content: JSON.parse(readFileSync(match.metadata.source, "utf-8")),
      });
    }
  }


  return res.status(200).send({
    openai: {
      references : openaiResponses,
      answer: generateResponse.openai?.text
    },
  });
});

export default router;
