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

  const onSent = async (prompt) => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setShowResult(true);
      setResultData("");

      setRecentPrompt(prompt);
      setInput(""); // ⬅️ Clear input instantly when sending

      let response = await runChat(prompt);

      // ⬅️ Prevent duplicate prompts in Recent
      setPrevPrompts((prev) =>
        prev.includes(prompt) ? prev : [...prev, prompt]
      );

      const raw = response;

      const bulbIcon = `<img src="/bulb_icon.png" alt="Bulb" class="bulb-glow" />`;
      const boldFormatted = raw
        .split("**")
        .map((chunk, i) => (i % 2 ? `<b>${chunk}</b>` : chunk))
        .join("");

      const withBreaks = boldFormatted.split("*").join("<br>");
      const finalResponse = withBreaks.split("###").join(bulbIcon);

      finalResponse.split(" ").forEach((word, i) => delayPara(i, word + " "));

      setHistory((prev) => [...prev, { prompt, response: finalResponse }]);
    } catch {
      setResultData("An error occurred.");
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
