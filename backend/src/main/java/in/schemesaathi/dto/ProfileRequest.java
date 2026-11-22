package in.schemesaathi.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ProfileRequest(
        @Size(max = 500) String query,
        @Size(max = 100) String category,
        @Size(max = 100) String state,
        @Min(0) Long annualIncome,
        @Min(1) @Max(120) Integer age) {
}
