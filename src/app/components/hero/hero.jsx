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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const recognitionRef = useRef(null);
  const profileRef = useRef(null);
  const shareModalRef = useRef(null);
  const menuDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (shareModalRef.current && !shareModalRef.current.contains(e.target)) {
        setShowShareModal(false);
        setLinkCopied(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(e.target)
      ) {
        setShowMenuDropdown(false);
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
  const handleFileDelete = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewURLs((prev) => prev.filter((_, i) => i !== index));
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

  const handleShare = () => {
    // Use current URL instead of generating a new one
    const currentUrl = window.location.href;
    setShareUrl(currentUrl);
    setShowShareModal(true);
    setLinkCopied(false);
  };

  const handleCreateLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleNewChat = () => {
    // Reload the page to start a new chat
    window.location.reload();
    setShowMenuDropdown(false);
  };

  const handleMenuToggle = () => {
    setShowMenuDropdown((prev) => !prev);
  };

  return (
    <div className="main">
      <div className="nav">
        <p>CHATGPT</p>
        <div className="nav-actions">
          {/* Share Button */}
          <div className="share-wrapper">
            <button className="share-btn" onClick={handleShare}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
              </svg>
              Share
            </button>

            {/* Menu Dropdown */}
            <div className="menu-dropdown-wrapper" ref={menuDropdownRef}>
              <button className="menu-dots" onClick={handleMenuToggle}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {showMenuDropdown && (
                <div className="menu-dropdown">
                  <button className="menu-item" onClick={handleNewChat}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    New Chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Section */}
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
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay">
          <div className="share-modal" ref={shareModalRef}>
            <div className="share-modal-header">
              <h3>Share public link to chat</h3>
              <button
                className="share-modal-close"
                onClick={() => {
                  setShowShareModal(false);
                  setLinkCopied(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="share-modal-content">
              <p className="share-description">
                Your name, custom instructions, and any messages you add after
                sharing stay private.
              </p>
              <div className="share-url-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-url-input"
                />
                <button
                  className={`create-link-btn ${linkCopied ? "copied" : ""}`}
                  onClick={handleCreateLink}
                >
                  🔗 {linkCopied ? "Copied!" : "Create link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <button
                    className="delete-file-btn"
                    onClick={() => handleFileDelete(i)}
                    aria-label="Delete file"
                  >
                    ✕
                  </button>
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
