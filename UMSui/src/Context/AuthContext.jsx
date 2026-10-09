import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { login as loginRequest } from "@/Services/AuthService";
import { logout as logoutRequest } from "@/Services/AuthService";
const AuthContext = createContext(null);

function getUserFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);

    return {
      id: decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],

      email:
        decodedToken[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],

      role: decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken"),
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken"),
  );

  const [user, setUser] = useState(() =>
    getUserFromToken(localStorage.getItem("accessToken")),
  );

  async function login(email, password) {
    const data = await loginRequest(email, password);

    const user = getUserFromToken(data.accessToken);

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(user);

    return user;
  }
  async function logout() {
    try {
      if (refreshToken && user) {
        await logoutRequest(user.email, refreshToken);
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
