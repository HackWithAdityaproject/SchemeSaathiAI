package in.schemesaathi.dto;

public record DocumentParseResponse(
        int extractedCharacters,
        Long annualIncome,
        Integer age,
        String message) {
}
