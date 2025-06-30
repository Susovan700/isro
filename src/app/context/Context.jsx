"use client"; // Important for using useState, useEffect in Next.js App Router

import { createContext, useState, useEffect } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const onSent = async (prompt) => {
    try {
      setLoading(true);
      const result = await runChat(prompt);
      setResultData(result);
      setShowResult(true); 
      setRecentPrompt(prompt);
      setPrevPrompts((prev) => [...prev, prompt]);
    } catch (error) {
      console.error("Error:", error);
      setResultData("An error occurred.");
      setShowResult(true); 
    } finally {
      setLoading(false);
    }
  };


  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
