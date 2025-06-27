"use client"
import { useState } from "react";
import "./sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); 

  const toggleSidebar = (e) => {
    if (e.currentTarget.className.includes('sidebar-icon')) {
      setIsOpen(!isOpen);
    }
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
        
        <div className="new-chat">
          <div className="plus-container">
            <img className="plus" src="plus_icon.png" alt="New chat" />
          </div>
          <p>New Chat</p>
        </div>

        <div className="recent">
          <p className="recent-title">Recent</p>
          <div className="recent-entry">
            <img className="message" src="/message_icon.png" alt="Message" />
            <p>What is react...</p>
          </div>
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