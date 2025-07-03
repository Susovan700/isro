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
  const [pasteNotification, setPasteNotification] = useState(false);

  const recognitionRef = useRef(null);
  const profileRef = useRef(null);
  const shareModalRef = useRef(null);
  const menuDropdownRef = useRef(null);
  const inputRef = useRef(null);

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

  // Add paste event listener
  useEffect(() => {
    const handlePaste = async (e) => {
      // Only handle paste if we're not in an input field or if we're in our specific input
      const isInOurInput = e.target === inputRef.current;
      const isInTextInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      
      if (!isInOurInput && isInTextInput) {
        return; // Let other inputs handle their own paste events
      }

      const clipboardData = e.clipboardData || window.clipboardData;
      const items = clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if the item is an image
        if (item.type.indexOf('image') === 0) {
          e.preventDefault(); // Prevent default paste behavior
          
          const blob = item.getAsFile();
          if (blob) {
            // Create a File object from the blob
            const timestamp = new Date().getTime();
            const file = new File([blob], `pasted-image-${timestamp}.png`, {
              type: blob.type,
            });
            
            // Add the file to uploaded files
            const previewUrl = URL.createObjectURL(file);
            setUploadedFiles((prev) => [...prev, file]);
            setPreviewURLs((prev) => [...prev, previewUrl]);
            
            // Show notification
            setPasteNotification(true);
            setTimeout(() => setPasteNotification(false), 2000);
            
            // Focus on input if not already focused
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
          break;
        }
      }
    };

    // Add event listener to document
    document.addEventListener('paste', handlePaste);
    
    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain'
    ];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload images, PDFs, DOC, DOCX, or text files.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create previews for images, show file icons for documents
    const previews = validFiles.map((file) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null; // For documents, we'll show file name instead
    });
    
    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setPreviewURLs((prev) => [...prev, ...previews]);
    
    // Clear the input to allow uploading the same file again
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if we have either text input or files
    if (!input.trim() && uploadedFiles.length === 0) {
      alert("Please enter a message or upload files.");
      return;
    }
    
    try {
      // If we have files, create FormData
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("prompt", input.trim() || "Please analyze these files.");
        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });
        
        // Clear the form
        setInput("");
        setUploadedFiles([]);
        setPreviewURLs([]);
        
        await onSent(formData);
      } else {
        // Text only
        await onSent(input.trim());
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("An error occurred while sending your message. Please try again.");
    }
  };

  const handleFileDelete = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewURLs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
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
      r.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        setListening(false);
        setShowVoiceBox(false);
      };
      recognitionRef.current = r;
    }
    recognitionRef.current.start();
  };

  const handleVoiceCancel = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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
    window.location.reload();
    setShowMenuDropdown(false);
  };

  const handleMenuToggle = () => {
    setShowMenuDropdown((prev) => !prev);
  };

  // Helper function to get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📰';
    return '📁';
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

      {/* Paste Notification */}
      {pasteNotification && (
        <div className="paste-notification">
          <div className="paste-notification-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Image pasted successfully!
          </div>
        </div>
      )}

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
            <p className="voice-text">
              {voiceText || "Listening..."}
            </p>
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
              {uploadedFiles.map((file, index) => (
                <div className="preview-item" key={index}>
                  <button
                    className="delete-file-btn"
                    onClick={() => handleFileDelete(index)}
                    aria-label="Delete file"
                  >
                    ✕
                  </button>
                  {previewURLs[index] ? (
                    <img
                      src={previewURLs[index]}
                      alt={`Preview of ${file.name}`}
                      className="preview-image"
                    />
                  ) : (
                    <div className="file-preview">
                      <div className="file-icon">{getFileIcon(file.type)}</div>
                      <span className="file-name">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="search-box">
            <input
              ref={inputRef}
              type="text"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder={uploadedFiles.length > 0 ? "Ask about your files..." : "Enter a prompt here or paste an image..."}
              disabled={loading}
            />
            <div>
              <input
                id="fileUpload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
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