package in.schemesaathi.service;

import in.schemesaathi.dto.MatchResult;
import in.schemesaathi.dto.ProfileRequest;
import in.schemesaathi.model.SchemeDocument;
import in.schemesaathi.repository.SchemeRepository;
import in.schemesaathi.config.SchemeCatalog;
import com.mongodb.MongoException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SchemeService {
    private final SchemeRepository repository;

    public SchemeService(SchemeRepository repository) {
        this.repository = repository;
    }

    public List<SchemeDocument> findAll(String category) {
        try {
            List<SchemeDocument> fromDatabase = category == null || category.isBlank()
                    ? repository.findAll()
                    : repository.findByCategoryIgnoreCase(category);
            if (!fromDatabase.isEmpty()) return fromDatabase;
        } catch (MongoException ignored) {
            // The curated catalog keeps browsing usable during an Atlas outage.
        }
        return filteredCatalog(category);
    }

    public SchemeDocument create(SchemeDocument scheme) {
        String id = scheme.id() == null || scheme.id().isBlank()
                ? UUID.randomUUID().toString()
                : scheme.id();
        SchemeDocument document = new SchemeDocument(
                id,
                scheme.name(),
                scheme.category(),
                scheme.description(),
                scheme.benefit(),
                scheme.eligibility(),
                scheme.documents(),
                scheme.state(),
                scheme.status(),
                scheme.officialUrl(),
                scheme.applicationUrl(),
                scheme.minimumAge(),
                scheme.maximumAge(),
                scheme.maximumAnnualIncome());
        return repository.save(document);
    }

    public List<MatchResult> match(ProfileRequest profile) {
        Set<String> terms = Arrays.stream(profile.query() == null ? new String[0] : profile.query().toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+"))
                .filter(term -> term.length() > 2)
                .collect(Collectors.toSet());
        List<SchemeDocument> availableSchemes;
        try {
            availableSchemes = repository.findAll();
            if (availableSchemes.isEmpty()) availableSchemes = SchemeCatalog.programs();
        } catch (MongoException ignored) {
            availableSchemes = SchemeCatalog.programs();
        }
        boolean queryHasHits = !terms.isEmpty() && availableSchemes.stream()
                .anyMatch(scheme -> matchingTerms(scheme, terms) > 0);

        return availableSchemes.stream()
                .filter(scheme -> profile.category() == null || profile.category().isBlank()
                        || scheme.category().equalsIgnoreCase(profile.category()))
                .filter(scheme -> profile.state() == null || profile.state().isBlank()
                        || scheme.state() == null || scheme.state().equalsIgnoreCase("All India")
                        || scheme.state().equalsIgnoreCase(profile.state()))
                .filter(scheme -> !queryHasHits || matchingTerms(scheme, terms) > 0)
                .filter(scheme -> profile.annualIncome() == null || scheme.maximumAnnualIncome() == null
                        || profile.annualIncome() <= scheme.maximumAnnualIncome())
                .filter(scheme -> profile.age() == null
                        || scheme.minimumAge() == null || profile.age() >= scheme.minimumAge())
                .filter(scheme -> profile.age() == null
                        || scheme.maximumAge() == null || profile.age() <= scheme.maximumAge())
                .map(scheme -> {
                    int score = 45;
                    if (profile.category() != null && !profile.category().isBlank()) score += 35;
                    score += (int) Math.min(20, matchingTerms(scheme, terms) * 5);
                    score = Math.min(score, 95);
                    String reason = profile.category() == null || profile.category().isBlank()
                            ? "Listed under " + scheme.category() + ". This discovery result is not an eligibility decision; review all criteria on the official portal."
                            : "Initial discovery match for " + scheme.category() + ". This is not an eligibility decision; confirm every criterion on the official portal.";
                    return MatchResult.from(scheme, score, reason);
                })
                .sorted(Comparator.comparingInt(MatchResult::matchScore).reversed())
                .toList();
    }

    private List<SchemeDocument> filteredCatalog(String category) {
        if (category == null || category.isBlank()) return SchemeCatalog.programs();
        return SchemeCatalog.programs().stream()
                    .filter(scheme -> scheme.category().equalsIgnoreCase(category))
                    .toList();
    }

    private long matchingTerms(SchemeDocument scheme, Set<String> terms) {
        String searchableText = (scheme.name() + " " + scheme.description() + " "
                + scheme.eligibility() + " " + scheme.category()).toLowerCase(Locale.ROOT);
        return terms.stream().filter(searchableText::contains).count();
    }
}
