import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(email, password) {
  const response = await axios.post(`${BASE_URL}/api/Auth/Login`, {
    email,
    password,
  });

  return response.data;
}
export async function logout(email, refreshToken) {
  const response = await axios.post(`${BASE_URL}/api/Auth/logout`, {
    email,
    refreshToken,
  });

  return response.data;
}
