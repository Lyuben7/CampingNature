using MVC.Intro.Attributes;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace MVC.Intro.Models
{
    public class Product
    {
        [DisplayName("Идентификатор")]
        public Guid Id { get; set; }
        [DisplayName("Наименование")]
        [Required(ErrorMessage = "Полето е задължително")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Дължината на името трябва да е между 3 и 50 символа")]
        [RegularExpression(@"^[A-Za-z\s\-]+$", ErrorMessage = "Името може да съдържа само букви, интервали и тирета")]
        public required string Name { get; set; }
        [DisplayName("Цена")]
        [Required(ErrorMessage = "Задължително е продуктът да има цена")]
        [Range(24.99,9999.99, ErrorMessage = "Цената трябва да е между 24.99 и 9999.99")]
        public decimal Price { get; set; }
    }
}
