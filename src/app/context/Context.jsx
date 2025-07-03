"use client";
import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [history, setHistory] = useState([]);
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [theme, setTheme] = useState("light");

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 50 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const onSent = async (promptOrFormData) => {
    try {
      setLoading(true);
      setShowResult(true);
      setResultData("");

      let prompt = "";
      let files = [];

      // Check if it's FormData (with files) or just a string prompt
      if (promptOrFormData instanceof FormData) {
        prompt = promptOrFormData.get("prompt");
        files = promptOrFormData.getAll("files");
        
        // Create a display prompt that includes file information
        const fileNames = files.map(f => f.name).join(", ");
        const displayPrompt = files.length > 0 
          ? `${prompt} [Files: ${fileNames}]`
          : prompt;
        
        setRecentPrompt(displayPrompt);
      } else {
        // It's a regular string prompt
        prompt = promptOrFormData;
        setRecentPrompt(prompt);
      }

      if (!prompt?.trim()) return;

      setInput(""); // Clear input instantly when sending

      // Call the updated runChat function with files
      let response = await runChat(prompt, files);

      // Prevent duplicate prompts in Recent
      const promptToStore = files.length > 0 
        ? `${prompt} [${files.length} file(s)]`
        : prompt;
      
      setPrevPrompts((prev) =>
        prev.includes(promptToStore) ? prev : [...prev, promptToStore]
      );

      const raw = response;

      const bulbIcon = `<img src="/bulb_icon.png" alt="Bulb" class="bulb-glow" />`;
      const boldFormatted = raw
        .split("**")
        .map((chunk, i) => (i % 2 ? `<b>${chunk}</b>` : chunk))
        .join("");

      const withBreaks = boldFormatted.split("*").join("<br>");
      const finalResponse = withBreaks.split("###").join(bulbIcon);

      // Clear previous result and start typing animation
      setResultData("");
      finalResponse.split(" ").forEach((word, i) => delayPara(i, word + " "));

      setHistory((prev) => [...prev, { 
        prompt: promptToStore, 
        response: finalResponse,
        files: files.length > 0 ? files.map(f => ({ name: f.name, type: f.type })) : []
      }]);
    } catch (error) {
      console.error("Error in onSent:", error);
      setResultData("An error occurred while processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    history,
    setHistory,
    prevPrompts,
    onSent,
    recentPrompt,
    setRecentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;