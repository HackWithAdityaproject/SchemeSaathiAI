package in.schemesaathi.dto;

import in.schemesaathi.model.SchemeDocument;

public record MatchResult(
        String id,
        String name,
        String category,
        String description,
        String benefit,
        String eligibility,
        java.util.List<String> documents,
        String state,
        String status,
        String officialUrl,
        String applicationUrl,
        int matchScore,
        String matchReason) {

    public static MatchResult from(SchemeDocument scheme, int score, String reason) {
        return new MatchResult(
                scheme.id(), scheme.name(), scheme.category(), scheme.description(),
                scheme.benefit(), scheme.eligibility(), scheme.documents(), scheme.state(),
                scheme.status(), scheme.officialUrl(), scheme.applicationUrl(), score, reason);
    }
}
