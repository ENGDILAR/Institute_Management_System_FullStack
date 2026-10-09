
namespace Lpgin2.DTOs.Response
{
    public class AddCourseOfferingMarksResponseDTO
    {
        public string Message { get; set; } = string.Empty;

        public int TotalReceived { get; set; }

        public int Added { get; set; }

        public int Skipped { get; set; }

        public List<AddedMarkResponseDTO> AddedMarks { get; set; } = new();

        public List<SkippedMarkResponseDTO> SkippedMarks { get; set; } = new();
    }

    public class AddedMarkResponseDTO
    {
        public int EnrollmentId { get; set; }

        public decimal Mark { get; set; }
    }

    public class SkippedMarkResponseDTO
    {
        public int EnrollmentId { get; set; }

        public string Reason { get; set; } = string.Empty;
    }
}