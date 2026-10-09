import axiosClient from "@/API/axiosClient";

export async function getMyMarks() {
  const response = await axiosClient.get("/api/StudentMarks/MyMarks");

  return response.data;
}
