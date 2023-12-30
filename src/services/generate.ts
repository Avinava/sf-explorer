import { Chroma } from "langchain/vectorstores/chroma";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import dotenv from "dotenv";
import { PromptTemplate } from "langchain/prompts";
import { readFileSync } from "fs";

dotenv.config();

const DEFAULT_MODEL_NAME = "gpt-3.5-turbo-16k";
const DEFAULT_COLLECTION_NAME = "sfdx-docs";
const QA_PROMPT_TEMPLATE = `
You are a helpful Salesforce cli assistant. Use the context provided below to generate the answer, using the sf commands.

Use the following pieces of context to answer the question at the end. Use sf commands from the context to craft your answer.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

# CONTEXT:
{context}

# QUESTION:
{question}

# RESPONSE FORMAT:
<<describe the solution in markdown>>
## Steps
<<provide examples and steps>>

# RESPONSE ANSWER:
`.trim();

class Generate {
  public static async run(queryString: string) {
    const model = this.createModel();
    const embeddings = this.createEmbeddings();
    const vectorStore = await this.createVectorStore(embeddings);
    const chain = this.createChain(model, vectorStore);
    const response = await chain.call({ question: queryString, chat_history: [] });

    return {
      openai: await this.enrich(response),
    };
  }

  private static createModel() {
    return new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 3000,
      modelName: process.env.OPENAI_MODEL_NAME || DEFAULT_MODEL_NAME,
    });
  }

  private static createEmbeddings() {
    return new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  private static async createVectorStore(embeddings: OpenAIEmbeddings) {
    return await Chroma.fromExistingCollection(embeddings, {
      collectionName: process.env.COLLECTION_NAME || DEFAULT_COLLECTION_NAME,
      url: `http://localhost:${process.env.CHROMADB_PORT}`,
    });
  }

  private static createChain(model: OpenAI, vectorStore: Chroma) {
    return ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
      returnSourceDocuments: true,
      qaChainOptions: {
        type: "stuff",
        prompt: PromptTemplate.fromTemplate(QA_PROMPT_TEMPLATE),
      },
      returnGeneratedQuestion: true,
    });
  }

  private static async enrich(response: any) {
    const openaiResponses = [];

    if (response.sourceDocuments) {
      for (const match of response.sourceDocuments) {
        openaiResponses.push({
          ...match,
          content: JSON.parse(readFileSync(match.metadata.source, "utf-8")),
        });
      }
    }

    return {
      sourceDocuments: openaiResponses,
      text: response.text,
    };
  }
}

export default Generate;
