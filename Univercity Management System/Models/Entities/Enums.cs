namespace Lpgin2.Models.Entities
{
    public class Enums
    {
        public enum enUserRoles 
        {
            admin=1,
            instructor=2,
            student=3
        };

        public enum enCourseOfferingStatus
        {
            Open = 1,
            Closed = 2,
            Cancelled = 3,
            Completed =4
        }

        public enum enExamTypes
        {
            First=1,
            Secound=2,
            Final=3
        }
    }
}
