import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BASE_URL = import.meta.env.VITE_API_URL;

const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function refreshAccessToken() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) {
    throw new Error("No access token available");
  }

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // استخراج Email من الـ Access Token
  const decodedToken = jwtDecode(accessToken);

  const email =
    decodedToken[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ];

  if (!email) {
    throw new Error("Email not found in access token");
  }

  // إرسال Refresh Request
  const response = await refreshClient.post("/api/Auth/Refresh", {
    email,
    refreshToken,
  });

  const newAccessToken = response.data.accessToken;
  const newRefreshToken = response.data.refreshToken;

  if (!newAccessToken) {
    throw new Error("No access token returned from server");
  }

  // تحديث Access Token
  localStorage.setItem("accessToken", newAccessToken);

  // تحديث Refresh Token
  if (newRefreshToken) {
    localStorage.setItem("refreshToken", newRefreshToken);
  }

  return newAccessToken;
}

export default refreshClient;
