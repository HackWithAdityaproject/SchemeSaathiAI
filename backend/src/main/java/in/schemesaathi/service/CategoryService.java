package in.schemesaathi.service;

import in.schemesaathi.dto.CategoryRequest;
import in.schemesaathi.model.CategoryDocument;
import in.schemesaathi.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.mongodb.MongoException;

import java.text.Normalizer;
import java.util.Locale;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;

@Service
public class CategoryService {
    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<CategoryDocument> findAll() {
        try {
            List<CategoryDocument> categories = repository.findAll();
            if (!categories.isEmpty()) return categories;
        } catch (MongoException ignored) {
        }
        return List.of(
                new CategoryDocument("students", "Students", "School, college, and technical education support."),
                new CategoryDocument("farmers", "Farmers", "Agriculture, crop, irrigation, and equipment support."),
                new CategoryDocument("women", "Women", "Education, livelihood, and welfare support."),
                new CategoryDocument("senior-citizens", "Senior Citizens", "Pensions, healthcare, and social security."),
                new CategoryDocument("persons-with-disabilities", "Persons with Disabilities", "Education, accessibility, and livelihood support."),
                new CategoryDocument("economically-weaker-families", "Economically Weaker Families", "Financial, housing, education, and social welfare."),
                new CategoryDocument("unemployed-youth", "Unemployed Youth", "Skills, training, employment, and self-employment."),
                new CategoryDocument("entrepreneurs-and-small-businesses", "Entrepreneurs and Small Businesses", "Business finance and enterprise support."),
                new CategoryDocument("workers-and-labourers", "Workers and Labourers", "Insurance, pensions, and labour welfare."),
                new CategoryDocument("general-citizens", "General Citizens", "Central and state government services.")
        );
    }

    public CategoryDocument create(CategoryRequest request) {
        if (repository.existsByNameIgnoreCase(request.name().trim())) {
            throw new ResponseStatusException(CONFLICT, "A category with this name already exists.");
        }
        String id = Normalizer.normalize(request.name(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (id.isBlank()) id = UUID.randomUUID().toString();
        if (repository.existsById(id)) {
            throw new ResponseStatusException(CONFLICT, "A category with this identifier already exists.");
        }
        return repository.save(new CategoryDocument(id, request.name().trim(), request.description()));
    }
}
