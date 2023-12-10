import { Chroma } from "langchain/vectorstores/chroma";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import dotenv from "dotenv";
import { PromptTemplate } from "langchain/prompts";
dotenv.config();

class Generate {
  public static async run(queryString: string) {
    const model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 3000,
      modelName: process.env.OPENAI_MODEL_NAME || "gpt-3.5-turbo-16k",
    });
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: process.env.COLLECTION_NAME || "sfdx-docs",
    });

    // https://stackoverflow.com/questions/76653423/how-to-combine-conversationalretrievalqachain-agents-and-tools-in-langchain
    const QA_PROMPT = `You are a helpful Salesforce AI cli assistant. You are helping a Salesforce developer with a question.
Using the context, generate the answer for the developer using the sf commands only.
sfdx command is deprecated, never use it in response, instead use the new sf command.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}

Response Format:
<<describe the solution in HTML format, make sure properly format the html using br, h1, h2, div, p, bold, list, don't use any background>>
<<provide examples and steps, properly format using tailwind css classes>>
<<for code snippets use code tag and tailwind css classes, use dark color for text>>


RESPONSE ANSWER HTML:`;

    const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
      returnSourceDocuments: true,
      qaChainOptions: {
        type: "stuff",
        prompt: PromptTemplate.fromTemplate(QA_PROMPT),
      },
    });

    return {
      openai: await chain.call({ question: queryString, chat_history: [] })
    };
  }
}

export default Generate;
