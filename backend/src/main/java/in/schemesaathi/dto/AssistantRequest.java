package in.schemesaathi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AssistantRequest(
        @NotBlank @Size(max = 1000) String question,
        @Size(max = 20) String language) {
}
