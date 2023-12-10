# sf-explorer

Find the right sf commands without digging through the documentation.


## Prerequisites

Before getting started with sf-explorer, please ensure that you have the following prerequisites in place:

- Node.js installed
- Yarn package manager installed
- Chroma installed and running

## .env Setup

To use sf-explorer, you will need to set up your environment variables. Follow the steps below:

1. Obtain an OpenAI API key.
2. Open the `.env` file in your project directory.
3. Set the value of `OPENAI_API_KEY` to your OpenAI API key.

## Setup

To set up sf-explorer for your project, follow the steps below:

1. Install the necessary packages by running `yarn install` in your project directory.
2. Run `yarn refresh-chroma` to ensure Chroma is up to date.
3. Run `yarn dev` to start sf-explorer locally.
4. Open http://localhost:7456/ to checkout the app

## Publishing

To publish your sf-explorer app, follow these steps:

1. Run `yarn build`.
2. Publish the generated build files to your desired hosting platform.

