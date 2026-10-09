namespace Lpgin2.DTOs.Dashboard
{
    public class StudentDashboardDTO
    {
        public string StudentName { get; set; } = string.Empty;

        public int TotalCourses { get; set; }

        public int SuccessfulCourses { get; set; }

        public int CompletedHours { get; set; }

        public int TotalEnrollments { get; set; }
        public decimal Average { get; set; }

        public List<StudentCourseDTO> Courses { get; set; } = new();

        public List<ExamPerformanceDTO> ExamPerformance { get; set; } = new();
    }

    public class StudentCourseDTO
    {
        public string CourseName { get; set; } = string.Empty;

        public int Hours { get; set; }

        public decimal? TotalMark { get; set; }

        public bool IsPassed { get; set; }
    }

    public class ExamPerformanceDTO
    {
        public string ExamType { get; set; } = string.Empty;

        public decimal Average { get; set; }
    }
}
