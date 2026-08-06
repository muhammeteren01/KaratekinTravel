namespace Core.DTOs.Gallery
{
    public class GalleryImageDto
    {
        public Guid Id { get; set; }
        public string ImageUrl { get; set; }
        public string? Caption { get; set; }
        public int DisplayOrder { get; set; }
    }
}