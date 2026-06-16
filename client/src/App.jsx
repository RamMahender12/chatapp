import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ChatPage from "./pages/ChatPage";
import CampaignStep2Recipients from "./pages/CampaignStep2Recipients";
import { AnimatePresence } from "framer-motion";

function App() {
  const { user } = useAuth();

  const VerifiedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (!user.isVerified) return <Navigate to="/verify" />;
    return children;
  };

  return (
    <div className="h-screen w-screen flex bg-dark-950 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-primary/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-secondary/[0.03] blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[400px] h-[400px] rounded-full bg-accent-tertiary/[0.02] blur-[80px]" />
      </div>

      <div className="relative w-full h-full flex overflow-hidden z-10">
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to={user.isVerified ? "/" : "/verify"} /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/verify" /> : <Register />}
            />
            <Route
              path="/verify"
              element={
                user ? (
                  user.isVerified ? (
                    <Navigate to="/" />
                  ) : (
                    <VerifyEmail />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/checkfigma"
              element={<CampaignStep2Recipients />}
            />
            <Route
              path="/*"
              element={
                <VerifiedRoute>
                  <ChatPage />
                </VerifiedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
