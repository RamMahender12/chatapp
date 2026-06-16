import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("userInfo", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post("/api/auth/register", {
      name,
      email,
      password,
    });
    localStorage.setItem("userInfo", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  const sendOTP = async () => {
    const { data } = await axios.post("/api/verify/send-otp");
    return data;
  };

  const verifyOTP = async (otp) => {
    const { data } = await axios.post("/api/verify/verify-otp", { otp });
    // Update user verification status
    const updatedUser = { ...user, isVerified: true };
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, sendOTP, verifyOTP, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
