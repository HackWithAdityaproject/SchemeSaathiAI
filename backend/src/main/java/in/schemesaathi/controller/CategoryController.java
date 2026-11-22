package in.schemesaathi.controller;

import in.schemesaathi.dto.CategoryRequest;
import in.schemesaathi.model.CategoryDocument;
import in.schemesaathi.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/categories")
    public List<CategoryDocument> categories() {
        return categoryService.findAll();
    }

    @PostMapping("/admin/categories")
    public CategoryDocument addCategory(@Valid @RequestBody CategoryRequest request) {
        return categoryService.create(request);
    }
}
