"use client";
import { useState, useContext } from "react";
import "./sidebar.css";
import { Context } from "../../context/Context"; // <-- Make sure this path is correct

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { onSent, prevPrompts, setRecentPrompt,newChat} = useContext(Context);

  const toggleSidebar = (e) => {
    if (e.currentTarget.className.includes("sidebar-icon")) {
      setIsOpen(!isOpen);
    }
  };

  const handlePromptClick = (prompt) => {
    setRecentPrompt(prompt);
    onSent(prompt);
  };

  return (
    <div className={`sidebar-container ${isOpen ? "open" : "closed"}`}>
      <div className="top">
        <div className="sidebar-header">
          <img
            src="/sidebar_icon.png"
            className="sidebar-icon"
            alt="Menu"
            onClick={toggleSidebar}
          />
        </div>

        <div onClick={()=>newChat()} className="new-chat">
          <div className="plus-container">
            <img className="plus" src="/plus_icon.png" alt="New chat" />
          </div>
          <p>New Chat</p>
        </div>

        <div className="recent">
          <p className="recent-title">Recent</p>
          {prevPrompts.map((item, index) => (
            <div
              className="recent-entry"
              key={index}
              onClick={() => handlePromptClick(item)}
            >
              <img className="message" src="/message_icon.png" alt="Message" />
              <p>{item.slice(0, 18)}...</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom">
        <div className="bottom-item">
          <div className="icon-container">
            <img className="help" src="/question_icon.png" alt="Help" />
          </div>
          <p>Help</p>
        </div>
        <div className="bottom-item">
          <div className="icon-container">
            <img className="time" src="/history_icon.png" alt="Activity" />
          </div>
          <p>Activity</p>
        </div>
        <div className="bottom-item">
          <div className="icon-container">
            <img className="setting" src="/setting_icon.png" alt="Settings" />
          </div>
          <p>Settings</p>
        </div>
      </div>
    </div>
  );
}
