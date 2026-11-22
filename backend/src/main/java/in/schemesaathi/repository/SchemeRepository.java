package in.schemesaathi.repository;

import in.schemesaathi.model.SchemeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SchemeRepository extends MongoRepository<SchemeDocument, String> {
    List<SchemeDocument> findByCategoryIgnoreCase(String category);
}
