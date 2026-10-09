using static Lpgin2.Models.Entities.Enums;

namespace Lpgin2.DTOs.Response
{
    public class CourseOfferResponseDTO
    {
        public string? Enrollments { set; get; }
       public  int? OfferId { set; get; }
        public  string? OfferName { set; get; }
        public  int? CourseId { set; get; }
        public  string? CourseName { set; get; }
        public int? DoctorId { set; get; }
        public  string? DoctorName { set; get; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public int? Capacity { get; set; }
        public enCourseOfferingStatus Status { get; set; } = enCourseOfferingStatus.Open;
    }
}
