# sf-explorer - Simplify Your Search for sf Commands

![home.png](/screenshots/home.png)

## Introduction

sf-explorer is a tool that helps you find the right sf commands without having to dig through the documentation. Under the hood, sf-explorer uses a vector store (ChromaDB) to store and index the Salesforce CLI documentation. This indexed data is then used to provide accurate and relevant command suggestions based on your queries.

The tool leverages OpenAI embeddings to understand the context and semantics of your queries. It uses the ConversationalRetrievalQAChain from Langchain to generate responses, ensuring that the answers you get are not only accurate but also contextually relevant to your query.

The tool showcases the power of document search and indexing using OpenAI embeddings to understand the context and semantics of your queries.

Demo : https://explorer.sfdxy.com/

## Prerequisites

Before getting started with sf-explorer, make sure you have the following prerequisites in place:

- Node.js installed
- Yarn package manager installed
- Chroma installed and running

## .env Setup

To use sf-explorer, you need to set up your environment variables. Follow the steps below:

1. Obtain an OpenAI API key.
2. Open the `.env` file in your project directory.
3. Set the value of `OPENAI_API_KEY` to your OpenAI API key.

## Setup

To set up sf-explorer for your project, follow the steps below:

1. Install the necessary packages by running `yarn install` in your project directory.
2. Run `yarn refresh-chroma` to ensure Chroma is up to date.
3. Run `yarn dev` to start sf-explorer locally.
4. Open http://localhost:7456/ to access the app.

## Data Ingestion and Downloading

### Ingest.ts

`ingest.ts` is a script responsible for loading and processing Salesforce CLI documentation from a specified directory. It splits the documents into chunks and stores them in a Chroma vector store. This process helps in creating an indexed data store that can be used to provide accurate and relevant command suggestions based on user queries.

### Download.ts

`download.ts` is a script that downloads all the Salesforce CLI command documentation in JSON format. It fetches the metadata, processes the content, and stores it in a specified directory for further use. This script ensures that the most recent and relevant documentation is available for the `ingest.ts` script to process and store in the Chroma vector store.

## Publishing

To publish your sf-explorer app, follow these steps:

1. Run `yarn build`.
2. Publish the generated build files to your desired hosting platform.

## Inspired By
sf-explorer was inspired by [gitexplorer](https://github.com/summitech/gitexplorer), a similar tool for finding the right Git commands.
