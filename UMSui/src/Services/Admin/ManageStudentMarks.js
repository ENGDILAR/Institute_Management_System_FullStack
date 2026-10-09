import axiosClient from "@/API/axiosClient";

export async function addStudentMark(mark) {
  const response = await axiosClient.post("/api/StudentMarks/AddNewMark", mark);

  return response.data;
}

export async function addCourseOfferingMarks(data) {
  const response = await axiosClient.post(
    "/api/StudentMarks/AddCourseOfferingMarks",
    data,
  );

  return response.data;
}

export async function updateStudentMark(mark) {
  const response = await axiosClient.put("/api/StudentMarks/UpdateMark", mark);

  return response.data;
}

export async function getAllMarksByCourseOfferingID(
  courseOfferingId,
  pageNumber = 1,
  pageSize = 20,
) {
  const response = await axiosClient.get(
    `/api/StudentMarks/GetAllMarksByCourseOfferingID/${courseOfferingId}`,
    {
      params: {
        pageNumber,
        pageSiz: pageSize,
      },
    },
  );

  if (response.status === 204) {
    return {
      pageNumber,
      pageSiz: pageSize,
      TotalEnrollments: 0,
      totalPages: 0,
      data: [],
    };
  }

  return response.data;
}

export async function getMarksByStudentID(studentId) {
  const response = await axiosClient.get(
    `/api/StudentMarks/GetMarksByStudentID/${studentId}`,
  );

  if (response.status === 204) {
    return [];
  }

  return Array.isArray(response.data) ? response.data : [];
}
