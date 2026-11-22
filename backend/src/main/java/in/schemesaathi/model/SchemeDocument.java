package in.schemesaathi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("schemes")
public record SchemeDocument(
        @Id String id,
        String name,
        String category,
        String description,
        String benefit,
        String eligibility,
        List<String> documents,
        String state,
        String status,
        String officialUrl,
        String applicationUrl,
        Integer minimumAge,
        Integer maximumAge,
        Long maximumAnnualIncome) {
}
