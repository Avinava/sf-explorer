import React from "react";
import { Footer } from "../components/Footer";
import { useAppContext } from "../Context";

const Main = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { query, setQuery, response, setResponse } = useAppContext();

  const [currentQuery, setCurrentQuery] = React.useState(0);
  const [currentChar, setCurrentChar] = React.useState(0);

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

  React.useEffect(() => {
    const queryTimer = setInterval(() => {
      setCurrentQuery((currentQuery + 1) % exampleQueries.length);
      setCurrentChar(0);
    }, 3000);

    const charTimer = setInterval(() => {
      setCurrentChar(currentChar => currentChar + 1);
    }, 100);

    return () => {
      clearInterval(queryTimer);
      clearInterval(charTimer);
    };
  }, [currentQuery]);

  const cleanup = (html: string = "") => {
    html = html.replace(/>\s+</g, "><");
    html = html.replace(/<br><br>/g, "<div>");
    return html;
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
      data.openai.references = data.openai.references.map((ref: any, i: number) => {
        ref.index = i;
        ref.content.help = ref.content.help || {};
        ref.content.help.html = cleanup(ref.content.help?.html);
        return ref;
      });
      setResponse(data);
    } catch (err) {
      console.error(err);
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
        <div className="bg-slate-800 text-slate-50 text-sm p-3 md:rounded shadow-lg flex justify-between">
          <div className="text-slate-500 inline-flex">
            <a
              className="font-medium hover:underline text-slate-50"
              href="https://github.com/Avinava/sf-explorer"
              target="_blank"
              rel="noreferrer"
            >
              Check<span className="hidden sm:inline"> on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-3/4">
        <div className="inline-flex">
          <span className="text-3xl font-bold">sf&nbsp;</span>
          <span className="text-3xl font-bold font-medium hover:underline text-emerald-400">command&nbsp;</span>
          <span className="text-3xl font-bold">explorer &nbsp;</span>
        </div>
        <p className="mt-2">Find the right commands you need without digging through the documentation.</p>
        <p className="text-sm text-gray-500">Powered by OpenAI</p>
        <div className="flex items-center border-2 p-0 w-full my-3 relative">
          <input
            className={`text-2xl font-bold font-medium p-3 flex-grow border-emerald-400 ${
              isLoading ? "opacity-50" : ""
            }`}
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
            className="ml-2 bg-emerald-400 text-white px-4 py-2 rounded h-full w-20 flex items-center justify-center"
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
              "Send"
            )}
          </button>
        </div>
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <p className="text-xl font-medium">
            {exampleQueries[currentQuery].substring(0, currentChar)}
            <span className="animate-blink">|</span>
          </p>
        </div>
        {response.openai?.references && (
          <div className="flex flex-col items-start border-2 p-4 w-full my-3 bg-white shadow-lg openai w-full">
            <div className="mb-6 last:mb-0 bg-gray-800 text-white p-5 rounded border-l-8 border-emerald-500 mb-10 w-full">
              <div
                className="prose prose-sm max-w-none overflow-auto break-words text-gray-200"
                dangerouslySetInnerHTML={{ __html: response.openai?.answer }}
              />
              <p className="text-sm text-gray-400 mt-4">Generated by OpenAI</p>
            </div>
            <h2 className="font-medium text-indigo-800 font-bold text-2xl header">References</h2>
            <div className="flex flex-col items-start border-2 p-4 w-full my-3 bg-white shadow-lg w-full">
              {response.openai.references.map((reference: any) => (
                <div key={reference.content.index} className="mb-8 last:mb-0 w-full">
                  <h2 className="font-medium text-indigo-700 font-bold header text-2xl">{reference.content.title}</h2>
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
