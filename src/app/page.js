// page.js (main layout)
import "./page.css";
import Sidebar from "./components/sidebar/page";
import Hero from "./components/hero/hero";
import ContextProvider from "./context/Context";

export default function Home() {
    return (
        <ContextProvider>
            <div className="app-container">
                <Sidebar />
                <div className="main-content">
                    <Hero />
                </div>
            </div>
        </ContextProvider>
    );
}