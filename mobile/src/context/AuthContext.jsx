import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import KEYS, { getItem, setItem, removeItem } from "../utils/storage";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await getItem(KEYS.USER_INFO);
      if (storedUser) {
        setUser(storedUser);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedUser.token}`;
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    await setItem(KEYS.USER_INFO, data);
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
    await setItem(KEYS.USER_INFO, data);
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
    const updatedUser = { ...user, isVerified: true };
    await setItem(KEYS.USER_INFO, updatedUser);
    setUser(updatedUser);
    return data;
  };

  const logout = async () => {
    await removeItem(KEYS.USER_INFO);
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
