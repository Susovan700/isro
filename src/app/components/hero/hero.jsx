"use client";
import "./hero.css";
import { useContext } from "react";
import { Context } from "../../context/Context";

export default function Hero() {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
  } = useContext(Context);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await onSent(input);
  };

  return (
    <div className="main">
      <div className="nav">
        <p>CHATGPT</p>
        <img src="user_icon.png" alt="User icon" />
      </div>

      <div className="main-container">
        {!showResult ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, Dev.</span>
              </p>
              <p>How can I help you today...</p>
            </div>

            <div className="cards">
              <div
                className="card"
                onClick={() =>
                  setInput("Suggest beautiful places to see on an upcoming road trip")
                }
              >
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src="/compass_icon.png" alt="Compass icon" />
              </div>
              <div
                className="card"
                onClick={() =>
                  setInput("Brainstorm team bonding activities for our work")
                }
              >
                <p>Brainstorm team bonding activities for our work</p>
                <img src="/bulb_icon.png" alt="Bulb icon" />
              </div>
              <div
                className="card"
                onClick={() =>
                  setInput("Briefly summarize the concept urban planning")
                }
              >
                <p>Briefly summarize the concept urban planning</p>
                <img src="/message_icon.png" alt="Message icon" />
              </div>
              <div
                className="card"
                onClick={() => setInput("Improve the readability of the code")}
              >
                <p>Improve the readability of the code</p>
                <img src="/code_icon.png" alt="Code icon" />
              </div>
            </div>
          </>
        ) : (
          <div className="response">
            <h2>Response:</h2>
            {loading ? <p>Loading...</p> : <p>{resultData}</p>}
          </div>
        )}

        <div className="main-bottom">
          <form onSubmit={handleSubmit} className="search-box">
            <input
              type="text"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Enter a prompt here.."
              disabled={loading}
              required
            />
            <div>
              <img src="/gallery_icon.png" alt="Gallery icon" />
              <img src="/mic_icon.png" alt="Mic icon" />
              <button type="submit" disabled={loading}>
                <img id="send" src="/send_icon.png" alt="Send icon" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
