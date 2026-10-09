namespace Lpgin2.DTOs.Response
{
    public class CourseResponseDTO
    {

        public required int CourseId { get; set; }
        public int Offers { get; set; }
        public required string CourseName { get; set; }
        public int Hours { get; set; }
    }
}
