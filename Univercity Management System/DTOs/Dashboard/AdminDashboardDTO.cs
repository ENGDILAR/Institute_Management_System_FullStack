namespace Lpgin2.DTOs.Dashboard
{
    public class AdminDashboardDTO
    {
        public int TotalStudents { get; set; }
        public int TotalInstructors { get; set; }
        public int TotalCourses { get; set; }
        public int TotalCourseOfferings { get; set; }

        public List<OfferingStatusDTO> OfferingsByStatus { get; set; } = new();

        public List<CourseEnrollmentDTO> EnrollmentsByCourse { get; set; } = new();
    }

    public class OfferingStatusDTO
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class CourseEnrollmentDTO
    {
        public string CourseName { get; set; } = string.Empty;
        public int Students { get; set; }
    }
}

