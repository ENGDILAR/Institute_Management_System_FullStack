import axiosClient from "@/API/axiosClient";
export async function getStatistics() {
  try {
    const response = await axiosClient.get("/api/Dashboard/Statistics");

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCharts() {
  try {
    const response = await axiosClient.get("/api/Dashboard/Admin");

    return response.data;
  } catch (error) {
    console.error("Error fetching charts:", error);
    throw error;
  }
}
