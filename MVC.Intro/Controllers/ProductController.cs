using Microsoft.AspNetCore.Mvc;
using MVC.Intro.Models;
using MVC.Intro.Services;

namespace MVC.Intro.Controllers
{
    [Route("[controller]/[action]")]
    public class ProductController : Controller
    {
        private readonly IProductService _productService;
        private readonly ImageStorageService _imageStorage;
        private readonly IWebHostEnvironment _environment;

        public ProductController(
            IProductService productService,
            ImageStorageService imageStorage,
            IWebHostEnvironment environment)
        {
            _productService = productService;
            _imageStorage = imageStorage;
            _environment = environment;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View(_productService.GetAllProducts());
        }

        [HttpGet("{id:guid}")]
        public IActionResult Details(Guid id)
        {
            var product = _productService.GetProductById(id);
            if (product == null)
            {
                return NotFound();
            }

            return View(product);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new Product());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(Guid id)
        {
            var product = _productService.GetProductById(id);
            if (product != null)
            {
                _imageStorage.DeleteLocalImage(product.ImagePath);
                _productService.DeleteProduct(id);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult CreateProduct(Product product, IFormFile? imageFile)
        {
            // Keep previously uploaded path (hidden field) when the file input is empty after a validation retry.
            if (!TryAssignImage(product, imageFile, previousPath: product.ImagePath))
            {
                return View("Create", product);
            }

            if (!ModelState.IsValid)
            {
                return View("Create", product);
            }

            _productService.AddProduct(product);
            return RedirectToAction(nameof(Index));
        }

        [HttpGet("{id:guid}")]
        public IActionResult Edit(Guid id)
        {
            var product = _productService.GetProductById(id);
            if (product == null)
            {
                return NotFound();
            }

            return View(product);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(Product product, IFormFile? imageFile)
        {
            var existing = _productService.GetProductById(product.Id);
            if (existing == null)
            {
                return NotFound();
            }

            if (!TryAssignImage(product, imageFile, existing.ImagePath))
            {
                if (string.IsNullOrEmpty(product.ImagePath))
                {
                    product.ImagePath = existing.ImagePath;
                }

                return View(product);
            }

            if (!ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(product.ImagePath))
                {
                    product.ImagePath = existing.ImagePath;
                }

                return View(product);
            }

            if (!string.IsNullOrEmpty(product.ImagePath) && product.ImagePath != existing.ImagePath)
            {
                _imageStorage.DeleteLocalImage(existing.ImagePath);
            }

            _productService.UpdateProduct(product);
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult Debug()
        {
            if (!_environment.IsDevelopment())
            {
                return NotFound();
            }

            var debugInfo = _productService.GetAllProducts()
                .Select(p => new { p.Id, p.Name, p.ImagePath });
            return Json(debugInfo);
        }

        private bool TryAssignImage(Product product, IFormFile? imageFile, string? previousPath)
        {
            try
            {
                var savedPath = _imageStorage.SaveImage(imageFile);
                if (savedPath != null)
                {
                    product.ImagePath = savedPath;
                }
                else if (string.IsNullOrEmpty(product.ImagePath))
                {
                    product.ImagePath = previousPath;
                }

                return true;
            }
            catch (InvalidOperationException ex)
            {
                ModelState.AddModelError("ImagePath", ex.Message);
                return false;
            }
        }
    }
}
