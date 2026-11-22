package in.schemesaathi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("categories")
public record CategoryDocument(
        @Id String id,
        String name,
        String description) {
}
