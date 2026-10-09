using Lpgin2.Models.Entities;
using System.ComponentModel.DataAnnotations;
using static Lpgin2.Models.Entities.Enums;

namespace Lpgin2.Models.MTM
{
    public class clsCourseOffering
    {
        public int Id { set; get; }
        public required string OfferName { set; get; } 
        public required int CourseId { set; get; }
        public clsCourse Course { set; get; } = null!;
        public required int InstructorId { set; get; }
        public virtual clsInstructor Instructor { set; get; }=null!;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Capacity { get; set; }
        public enCourseOfferingStatus Status { get; set; } = enCourseOfferingStatus.Open;
        public virtual ICollection<clsEnrollments> Enrollments { get; set; } = new List<clsEnrollments>();

    }
}
