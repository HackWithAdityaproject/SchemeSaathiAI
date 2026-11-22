package in.schemesaathi.service;

import in.schemesaathi.dto.ProfileRequest;
import in.schemesaathi.dto.MatchResult;
import in.schemesaathi.model.SchemeDocument;
import in.schemesaathi.repository.SchemeRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SchemeServiceTest {
    private final SchemeRepository repository = mock(SchemeRepository.class);
    private final SchemeService service = new SchemeService(repository);

    @Test
    void filtersOutSchemesThatDoNotFitIncomeOrCategory() {
        SchemeDocument studentScheme = new SchemeDocument(
                "student", "Student support", "Students", "Education support", "Varies",
                "For students", List.of(), "All India", "Check official portal",
                "https://example.gov.in", "https://example.gov.in", null, null, 200_000L);
        SchemeDocument farmerScheme = new SchemeDocument(
                "farmer", "Farmer support", "Farmers", "Agriculture support", "Varies",
                "For farmers", List.of(), "All India", "Check official portal",
                "https://example.gov.in", "https://example.gov.in", null, null, null);
        when(repository.findAll()).thenReturn(List.of(studentScheme, farmerScheme));

        var matches = service.match(new ProfileRequest(null, "Students", null, 300_000L, null));

        assertThat(matches).isEmpty();
    }

    @Test
    void returnsOnlySchemesRelevantToTheSearchTerms() {
        SchemeDocument studentScheme = new SchemeDocument(
                "student", "Student scholarship", "Students", "College scholarship support", "Varies",
                "For students", List.of(), "All India", "Check official portal",
                "https://example.gov.in", "https://example.gov.in", null, null, null);
        SchemeDocument otherScheme = new SchemeDocument(
                "other", "Other support", "General Citizens", "General assistance", "Varies",
                "For residents", List.of(), "All India", "Check official portal",
                "https://example.gov.in", "https://example.gov.in", null, null, null);
        when(repository.findAll()).thenReturn(List.of(otherScheme, studentScheme));

        var matches = service.match(new ProfileRequest("college scholarship", null, null, null, null));

        assertThat(matches).extracting(MatchResult::id).containsExactly("student");
        assertThat(matches.get(0).matchReason()).contains("Students");
    }

    @Test
    void fallbackCatalogProvidesOfficialLinksWhenDatabaseIsEmpty() {
        when(repository.findAll()).thenReturn(List.of());

        var schemes = service.findAll(null);

        assertThat(schemes).isNotEmpty();
        assertThat(schemes).allMatch(scheme ->
                scheme.officialUrl() != null && scheme.officialUrl().startsWith("https://"));
        assertThat(schemes).anyMatch(scheme -> "Farmers".equals(scheme.category()));
        assertThat(schemes).anyMatch(scheme -> "Students".equals(scheme.category()));
        assertThat(schemes).anyMatch(scheme -> "Women".equals(scheme.category()));
    }
}
