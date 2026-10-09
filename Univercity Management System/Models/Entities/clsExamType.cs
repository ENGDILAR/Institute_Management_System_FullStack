namespace Lpgin2.Models.Entities
{
    public class clsExamType
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int MaxMark { get; set; }
        public ICollection<clsStudentMark> StudentMarks { get; set; } = new List<clsStudentMark>();
    }
}
