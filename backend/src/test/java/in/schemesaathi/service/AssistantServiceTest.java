package in.schemesaathi.service;

import in.schemesaathi.dto.AssistantRequest;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

class AssistantServiceTest {
    private final AssistantService service = new AssistantService(RestClient.create(), "", "gemini-2.0-flash");

    @Test
    void providesLocalizedGuidanceWithoutAnApiKey() {
        var english = service.answer(new AssistantRequest("How do I start?", "English"));
        var hindi = service.answer(new AssistantRequest("मैं कैसे शुरू करूँ?", "Hindi"));
        var telugu = service.answer(new AssistantRequest("నేను ఎలా ప్రారంభించాలి?", "Telugu"));
        var kannada = service.answer(new AssistantRequest("ನಾನು ಹೇಗೆ ಪ್ರಾರಂಭಿಸಲಿ?", "Kannada"));
        var tamil = service.answer(new AssistantRequest("எப்படித் தொடங்குவது?", "Tamil"));

        assertThat(english.answer()).contains("Explore schemes");
        assertThat(hindi.answer()).contains("श्रेणी");
        assertThat(telugu.answer()).contains("వర్గం");
        assertThat(kannada.answer()).contains("ವರ್ಗದ");
        assertThat(tamil.answer()).contains("பிரிவின்படி");
        assertThat(english.aiPowered()).isFalse();
        assertThat(hindi.aiPowered()).isFalse();
        assertThat(telugu.aiPowered()).isFalse();
        assertThat(kannada.aiPowered()).isFalse();
        assertThat(tamil.aiPowered()).isFalse();
    }
}
