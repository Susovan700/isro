"use client";
import "./hero.css";
import { useContext, useState, useRef, useEffect } from "react";
import { Context } from "../../context/Context";
import Profile from "../profile/profile";

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

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [showVoiceBox, setShowVoiceBox] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const recognitionRef = useRef(null);

  const profileRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    );
    setUploadedFiles((p) => [...p, ...files]);
    setPreviewURLs((p) => [...p, ...previews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const fd = new FormData();
    fd.append("prompt", input.trim());
    uploadedFiles.forEach((f) => fd.append("files", f));
    setInput("");
    setUploadedFiles([]);
    setPreviewURLs([]);
    await onSent(uploadedFiles.length ? fd : input.trim());
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }
    if (!recognitionRef.current) {
      const r = new SpeechRecognition();
      r.lang = "en-US";
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onstart = () => {
        setListening(true);
        setVoiceText("");
        setShowVoiceBox(true);
      };
      r.onend = () => setListening(false);
      r.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setVoiceText(t);
      };
      r.onerror = () => {
        setListening(false);
        setShowVoiceBox(false);
      };
      recognitionRef.current = r;
    }
    recognitionRef.current.start();
  };

  const handleVoiceCancel = () => {
    recognitionRef.current && recognitionRef.current.stop();
    setListening(false);
    setVoiceText("");
    setShowVoiceBox(false);
  };

  const handleVoiceConfirm = async () => {
    if (!voiceText.trim()) {
      handleVoiceCancel();
      return;
    }
    setShowVoiceBox(false);
    setListening(false);
    setInput("");
    await onSent(voiceText.trim());
    setVoiceText("");
  };

  return (
    <div className="main">
      <div className="nav">
        <p>CHATGPT</p>
        <div className="profile-wrapper" ref={profileRef}>
          <img
            src="/user_icon.png"
            alt="User"
            className="avatar"
            onClick={() => setShowProfile((prev) => !prev)}
          />
          {showProfile && <Profile />}
        </div>
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

            {/* cards */}
            <div className="cards">
              <div
                className="card"
                onClick={() =>
                  setInput(
                    "Suggest beautiful places to see on an upcoming road trip"
                  )
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
          <div className="result">
            <div className="result-title">
              <img src="/user_icon.png" alt="User icon" />
              <p className="user-prompt">
                <b>{recentPrompt}</b>
              </p>
            </div>

            <div className="result-data">
              <img src="/gemini_icon.png" alt="Gemini icon" />
              {loading ? (
                <div className="loading">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p
                  className="response-text"
                  dangerouslySetInnerHTML={{ __html: resultData }}
                ></p>
              )}
            </div>
          </div>
        )}

        {showVoiceBox && (
          <div className="voice-box">
            <div className={`voice-visual ${listening ? "anim" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="voice-text">Listening...</p>
            <button className="voice-cancel" onClick={handleVoiceCancel}>
              ✖
            </button>
            <button className="voice-confirm" onClick={handleVoiceConfirm}>
              ✔
            </button>
          </div>
        )}

        <div className="main-bottom">
          {uploadedFiles.length > 0 && (
            <div className="preview-area">
              {uploadedFiles.map((f, i) => (
                <div className="preview-item" key={i}>
                  {previewURLs[i] ? (
                    <img
                      src={previewURLs[i]}
                      alt="Preview"
                      className="preview-image"
                    />
                  ) : (
                    <span className="file-name">{f.name}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="search-box">
            <input
              type="text"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Enter a prompt here..."
              disabled={loading}
              required
            />
            <div>
              <input
                id="fileUpload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <img
                src="/gallery_icon.png"
                alt="Gallery icon"
                style={{ cursor: "pointer" }}
                onClick={() => document.getElementById("fileUpload").click()}
              />
              <div
                className="mic-wrapper"
                onClick={handleVoiceInput}
                style={{ cursor: "pointer" }}
              >
                <img src="/mic_icon.png" alt="Mic icon" />
              </div>
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
