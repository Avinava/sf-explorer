import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import dotenv from "dotenv";
dotenv.config();

class Loader {
  folderPath: string;
  vectorStore: Chroma | null;
  embeddings: OpenAIEmbeddings;
  constructor() {
    this.folderPath = "./data/processed/content/";
    this.vectorStore = null;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey : process.env.OPENAI_API_KEY
    });
  }

  public async load() {
    const directoryLoader = new DirectoryLoader(this.folderPath, {
      ".json": path => new JSONLoader(path),
    });

    const rawDocs = await directoryLoader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    await this.deleteIfExists();

    const vectorStore = await Chroma.fromDocuments(docs, this.embeddings, {
      collectionName: process.env.COLLECTION_NAME || "sfdx-docs",
      url: `http://localhost:${process.env.CHROMADB_PORT}`,
      collectionMetadata: {
        "hnsw:space": "cosine",
      },
    });

    const response = await vectorStore.similaritySearch("list all orgs", 1);
    console.log("###########response", response);
  }

  public async deleteIfExists() {
    const vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
      collectionName: process.env.COLLECTION_NAME || "sfdx-docs",
      url: `http://localhost:${process.env.CHROMADB_PORT}`,
    });

    const res = await vectorStore.collection?.get();

   // delete all documents
    await vectorStore.delete({
      ids: res?.ids,
    });

  }
}

new Loader().load();
