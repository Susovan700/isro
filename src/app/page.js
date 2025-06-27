// page.js (main layout)
import "./page.css";
import Sidebar from "./components/sidebar/page";
import Hero from "./components/hero/hero";

export default function Home() {
  return (
    <div className="app-container">
      <Sidebar/>
      <div className="main-content">
        <Hero/>
      </div>
    </div>
  );
}