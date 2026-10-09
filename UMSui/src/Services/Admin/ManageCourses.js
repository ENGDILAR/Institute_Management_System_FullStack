import axiosClient from "@/API/axiosClient";

export async function getCourses() {
  const response = await axiosClient.get("/api/Course/GetAllCourses");
  return response.data;
}

export async function getCourseByID(id) {
  const response = await axiosClient.get(`/api/Course/GetById/${id}`);
  return response.data;
}

export async function getCourseByName(name) {
  const response = await axiosClient.get("/api/Course/GetByName", {
    params: {
      name,
    },
  });

  return response.data;
}

export async function addCourse(course) {
  const response = await axiosClient.post("/api/Course/AddCourse", course);

  return response.data;
}

export async function updateCourse(id, course) {
  const response = await axiosClient.put(`/api/Course/Update/${id}`, course);

  return response.data;
}

export async function deleteCourse(id) {
  const response = await axiosClient.delete(`/api/Course/Delete/${id}`);

  return response.data;
}
