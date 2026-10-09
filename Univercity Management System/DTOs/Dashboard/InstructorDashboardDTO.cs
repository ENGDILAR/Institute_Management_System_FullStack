namespace Lpgin2.DTOs.Dashboard
{
    public class InstructorDashboardDTO
    {
        public string InstructorName { get; set; } = string.Empty;

        public int TotalCourses { get; set; }
        public int TotalOfferings { get; set; }
        public int TotalEnrollments { get; set; }
        public int TotalStudents { get; set; }

        public int SuccessfulStudents { get; set; }
        public int FailedStudents { get; set; }

        public decimal Average { get; set; }

        public List<InstructorCourseDTO> Courses { get; set; } = new();
    }

    public class InstructorCourseDTO
    {
        public int OfferingId { get; set; }

        public string CourseName { get; set; } = string.Empty;
        public string OfferName { get; set; } = string.Empty;

        public int Students { get; set; }

        public int CompletedStudents { get; set; }
        public int SuccessfulStudents { get; set; }
        public int FailedStudents { get; set; }

        public decimal AverageMark { get; set; }
    }
}