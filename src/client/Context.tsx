import React, { useContext, useState } from "react";

export interface Context {
  query: string;
  setQuery: (val: string) => void;
  response: any;
  setResponse: (val: any) => void;
}
const defaultVal = {
  query: "",
  setQuery: () => {},
  response: {},
  setResponse: () => {},
} as Context;

const context = React.createContext(defaultVal);

const { Provider } = context;

export const ContextWrapper = ({ children }: { children: any }) => {
  const [query, setQuery] = useState(defaultVal.query);
  const [response, setResponse] = useState(defaultVal.response);
  return <Provider value={{ query, setQuery, response, setResponse }}>{children}</Provider>;
};

export const useAppContext = () => useContext(context);
