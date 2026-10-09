using static Lpgin2.Models.Entities.Enums;

namespace Lpgin2.DTOs.Request.StudentMarkDTO
{
    public class AddCourseOfferingMarksDTO
    {
        public int CourseOfferingId { get; set; }

        public enExamTypes ExamTypeId { get; set; }

        public List<StudentMarkItemDTO> Marks { get; set; } = new();
    }

    public class StudentMarkItemDTO
    {
        public int EnrollmentId { get; set; }

        public decimal Mark { get; set; }
    }
}