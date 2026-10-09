import axiosClient from "@/API/axiosClient";

export async function getStudents() {
  try {
    const response = await axiosClient.get("/api/Students/AllStudents");

    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

export async function getStudentById(studentId) {
  try {
    const response = await axiosClient.get(
      `/api/Students/GetStudentByID/${studentId}`,
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching student with ID ${studentId}:`, error);
    throw error;
  }
}

export async function AddStudent(student) {
  try {
    const response = await axiosClient.post(
      "/api/Students/AddNewStudents",
      student,
    );

    return response.data;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
}

export async function UpdateStudent(studentId, student) {
  try {
    const response = await axiosClient.patch(
      `/api/Students/UpdateStudent?studentID=${studentId}`,
      student,
    );

    return response.data;
  } catch (error) {
    console.error(`Error updating student with ID ${studentId}:`, error);

    throw error;
  }
}

export async function DeleteStudent(studentId) {
  try {
    const response = await axiosClient.delete(
      `/api/Students/DeleteStudent/${studentId}`,
    );

    return response.data;
  } catch (error) {
    console.error(`Error deleting student with ID ${studentId}:`, error);

    throw error;
  }
}
