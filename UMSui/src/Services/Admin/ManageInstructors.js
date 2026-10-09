import axiosClient from "@/API/axiosClient";

export async function addInstructor(instructor) {
  const response = await axiosClient.post(
    "/api/Instructor/AddNewInstructor",
    instructor,
  );

  return response.data;
}

export async function updateInstructor(id, instructor) {
  const response = await axiosClient.put(
    `/api/Instructor/Update/${id}`,
    instructor,
  );

  return response.data;
}

export async function getAllInstructors() {
  const response = await axiosClient.get("/api/Instructor/AllInstructor");

  return response.data;
}

export async function getInstructorByID(id) {
  const response = await axiosClient.get(`/api/Instructor/GetInstructor/${id}`);

  return response.data;
}

export async function deleteInstructor(id) {
  const response = await axiosClient.delete(
    `/api/Instructor/DeleteInstructor/${id}`,
  );

  return response.data;
}
