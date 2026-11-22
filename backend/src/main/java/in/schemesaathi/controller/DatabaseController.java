package in.schemesaathi.controller;

import org.bson.Document;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/database")
public class DatabaseController {
    private static final String TEST_COLLECTION = "_schemesaathi_connection_test";

    private final MongoTemplate mongoTemplate;

    public DatabaseController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            Document ping = mongoTemplate.getDb().runCommand(new Document("ping", 1));
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("status", "UP");
            result.put("database", mongoTemplate.getDb().getName());
            result.put("ping", ping.getDouble("ok") != null ? ping.getDouble("ok") : ping.get("ok"));
            return ResponseEntity.ok(result);
        } catch (Exception exception) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("status", "DOWN");
            result.put("database", mongoTemplate.getDb().getName());
            result.put("message", "MongoDB is unreachable. Check credentials, TLS/network access, and cluster status.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(result);
        }
    }

    @Profile("local")
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection() {
        String id = UUID.randomUUID().toString();
        Document testDocument = new Document("_id", id)
                .append("purpose", "SchemeSaathi MongoDB connection test")
                .append("timestamp", System.currentTimeMillis());

        try {
            mongoTemplate.insert(testDocument, TEST_COLLECTION);
            Document retrieved = mongoTemplate.findById(id, Document.class, TEST_COLLECTION);
            if (retrieved == null) {
                throw new IllegalStateException("The test document could not be retrieved.");
            }

            mongoTemplate.remove(Query.query(Criteria.where("_id").is(id)), TEST_COLLECTION);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("status", "UP");
            result.put("database", mongoTemplate.getDb().getName());
            result.put("collection", TEST_COLLECTION);
            result.put("insertedAndRead", true);
            result.put("testDocumentRemoved", true);
            result.put("testDocumentId", id);
            return ResponseEntity.ok(result);
        } catch (Exception exception) {
            try {
                mongoTemplate.remove(Query.query(Criteria.where("_id").is(id)), TEST_COLLECTION);
            } catch (Exception ignored) {
                // Cleanup is best-effort if MongoDB is unavailable.
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("status", "DOWN");
            result.put("database", mongoTemplate.getDb().getName());
            result.put("message", "MongoDB insert/read test failed.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(result);
        }
    }
}
