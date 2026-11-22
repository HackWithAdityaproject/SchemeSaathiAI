package in.schemesaathi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("users")
public record UserDocument(
        @Id String id,
        String displayName,
        String email,
        String passwordHash,
        Instant createdAt) {
}
