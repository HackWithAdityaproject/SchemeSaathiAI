package in.schemesaathi.repository;

import in.schemesaathi.model.CategoryDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository extends MongoRepository<CategoryDocument, String> {
    boolean existsByNameIgnoreCase(String name);
}
