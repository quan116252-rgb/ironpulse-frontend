import { createContext, useContext, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem("gym_user"));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const save = ({ token, user }) => {
    localStorage.setItem("gym_token", token);
    localStorage.setItem("gym_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const login = async (email, password) => save(await authService.login(email, password));
  const register = async (data) => save(await authService.register(data));

  const logout = () => {
    localStorage.removeItem("gym_token");
    localStorage.removeItem("gym_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
