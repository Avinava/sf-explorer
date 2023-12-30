import React, { useState, useEffect } from "react";
import { Footer } from "../components/Footer";
import { useAppContext } from "../Context";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const exampleQueries = [
  "how to create a new apex class",
  "how to retrieve all metadata",
  "how to deploy all metadata",
  "how to tail debug logs",
  "how to create a scratch org",
  "how to create a package",
  "how to create a permission set",
  // Add more example queries as needed
];

const Main = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { query, setQuery, response, setResponse } = useAppContext();

  const [currentQuery, setCurrentQuery] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    const queryTimer = setInterval(() => {
      setCurrentQuery((currentQuery + 1) % exampleQueries.length);
      setCurrentChar(0);
    }, 5000);

    const charTimer = setInterval(() => {
      setCurrentChar(currentChar => currentChar + 1);
    }, 100);

    return () => {
      clearInterval(queryTimer);
      clearInterval(charTimer);
    };
  }, [currentQuery]);

  const cleanup = (html: string = "") => {
    return html.replace(/>\s+</g, "><").replace(/<br><br>/g, "<div>");
  };

  const doGPT = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/generate?query=${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setError("");
      if (res.status === 200) {
        data.openai.references = data.openai.references.map((ref: any, i: number) => {
          ref.index = i;
          ref.content.help = ref.content.help || {};
          ref.content.help.html = cleanup(ref.content.help?.html);
          return ref;
        });
        setResponse(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error: ", err);
      setError((err as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      doGPT();
    }
  };
  return (
    <div className="flex bg-white-100 font-sans items-center flex-col justify-between h-screen py-10 px-10 md:px-20">
      <div className="fixed bottom-0 right-0 w-full md:bottom-8 md:right-12 md:w-auto z-50">
        <div className="bg-blue-800 text-white text-sm p-3 md:rounded shadow-lg flex justify-between">
          <div className="text-white inline-flex">
            <a
              className="font-medium hover:underline text-white"
              href="https://github.com/Avinava/sf-explorer"
              target="_blank"
              rel="noreferrer"
            >
              Check<span className="hidden sm:inline"> on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-3/4 mt-5">
        <div className="inline-flex">
          <span className="text-3xl font-bold">sf&nbsp;</span>
          <span className="text-3xl font-bold font-medium hover:underline text-blue-600">command&nbsp;</span>
          <span className="text-3xl font-bold">explorer &nbsp;</span>
        </div>
        <p className="mt-8">Find the right commands you need without digging through the documentation.</p>
        <p className="mt-2 text-center">
          sf command explorer provides a quick way to find the right commands you need directly from
          <a
            className="text-blue-600 hover:underline"
            href="https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_unified.htm"
            target="_blank"
            rel="noreferrer"
          >
            &nbsp;sf cli documentation
          </a>
          . You can ask questions like "how to create a new apex class" or "how to retrieve all metadata" and get the
          right commands you need.
        </p>
        <p className="text-sm text-gray-500 m-4">Powered by OpenAI</p>
        <div className="flex items-center border-2 p-0 w-full my-3 relative">
          <input
            className={`text-2xl font-bold font-medium p-3 flex-grow border-blue-600 ${isLoading ? "opacity-50" : ""}`}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter what you want to do..."
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
          <button
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded h-full w-30 flex items-center justify-center"
            onClick={doGPT}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Search"
            )}
          </button>
        </div>
        <div className="m-4 p-2 border rounded bg-gray-100">
          <p className="text-xl font-medium">
            {exampleQueries[currentQuery].substring(0, currentChar)}
            <span className="animate-blink">|</span>
          </p>
        </div>
        {error && (
          <div className="mt-4 bg-red-200 p-2 rounded flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-800 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <h2 className="text-red-800 font-bold">Error</h2>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        {response.openai?.references && (
          <div className="flex flex-col items-start border-2 p-4 w-full my-3 bg-white shadow-lg openai w-full">
            <div className="mb-6 last:mb-0 bg-gray-800 text-white p-5 rounded border-l-8 border-blue-500 mb-10 w-full markdown-container">
              {/* <div
                className="prose prose-sm max-w-none overflow-auto break-words text-gray-200"
                dangerouslySetInnerHTML={{ __html: response.openai?.answer }}
              /> */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{response.openai?.answer}</ReactMarkdown>
              <p className="text-sm text-gray-400 mt-4">Generated by OpenAI</p>
            </div>
            <h2 className="font-medium text-blue-800 font-bold text-2xl header">References</h2>
            <div className="flex flex-col items-start border-2 p-4 w-full my-3 bg-white shadow-lg w-full">
              {response.openai.references.map((reference: any) => (
                <div key={reference.content.index} className="mb-8 last:mb-0 w-full">
                  <h2 className="font-medium text-blue-700 font-bold header text-2xl">{reference.content.title}</h2>
                  <div
                    className="prose prose-sm max-w-none overflow-auto break-words"
                    dangerouslySetInnerHTML={{ __html: reference.content.help.html }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Main;
