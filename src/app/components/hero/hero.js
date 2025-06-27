"use client";
import "./hero.css";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

export default function Hero() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(input);
      setOutput(result.response.text());
    } catch (error) {
      console.error("Error generating content:", error);
      setOutput("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main"> 
      <div className="nav">
        <p>CHATGPT</p>
        <img src="user_icon.png" alt="User icon" />
      </div>
      <div className="main-container">
        <div className="greet">
          <p><span>Hello, Dev.</span></p>
          <p>How can I help you today...</p>
          {output && (
            <div className="response">
              <h2>Response:</h2>
              <p>{output}</p>
            </div>
          )}
        </div>
        <div className="cards">
          <div className="card" onClick={() => setInput("Suggest beautiful places to see on an upcoming road trip")}>
            <p>Suggest beautiful places to see on an upcoming road trip</p>
            <img src="/compass_icon.png" alt="Compass icon" />
          </div>
          <div className="card" onClick={() => setInput("Brainstorm team bonding activities for our work")}>
            <p>Brainstorm team bonding activities for our work</p>
            <img src="/bulb_icon.png" alt="Bulb icon" />
          </div>
          <div className="card" onClick={() => setInput("Briefly summarize the concept urban planning")}>
            <p>Briefly summarize the concept urban planning</p>
            <img src="/message_icon.png" alt="Message icon" />
          </div>
          <div className="card" onClick={() => setInput("Improve the readability of the code")}>
            <p>Improve the readability of the code</p>
            <img src="/code_icon.png" alt="Code icon" />
          </div>
        </div>
        <div className="main-bottom">
          <form onSubmit={handleSubmit} className="search-box">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a prompt here.."
              disabled={isLoading}
              required
            />
            <div>
              <img src="/gallery_icon.png" alt="Gallery icon" />
              <img src="/mic_icon.png" alt="Mic icon" />
              <button type="submit" disabled={isLoading}>
                <img src="/send_icon.png" alt="Send icon" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}