package in.schemesaathi.service;

import in.schemesaathi.dto.AssistantRequest;
import in.schemesaathi.dto.AssistantResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AssistantService {
    private static final Logger logger = LoggerFactory.getLogger(AssistantService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public AssistantService(
            RestClient restClient,
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.model:gemini-2.0-flash}") String model) {
        this.restClient = restClient;
        this.apiKey = apiKey;
        this.model = model;
    }

    public AssistantResponse answer(AssistantRequest request) {
        if (apiKey.isBlank()) {
            String language = request.language() == null ? "" : request.language().toLowerCase(Locale.ROOT);
            String answer;
            if (language.startsWith("hi")) {
                answer = "श्रेणी के अनुसार योजनाएँ देखें और पात्रता व दस्तावेज़ जाँचें। समय-सीमा और आवेदन की स्थिति आधिकारिक सरकारी वेबसाइट पर देखें। "
                        + "यह सहायक अंतिम पात्रता तय नहीं करता।";
            } else if (language.startsWith("te")) {
                answer = "వర్గం ద్వారా పథకాలను చూడండి; అర్హత, పత్రాలను పరిశీలించండి. గడువు మరియు దరఖాస్తు స్థితిని అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లో చూడండి. "
                        + "ఈ సహాయకుడు తుది అర్హతను నిర్ణయించడు.";
            } else if (language.startsWith("kn")) {
                answer = "ವರ್ಗದ ಪ್ರಕಾರ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ; ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಗಡುವು ಮತ್ತು ಅರ್ಜಿ ಸ್ಥಿತಿಯನ್ನು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ನೋಡಿ. "
                        + "ಈ ಸಹಾಯಕ ಅಂತಿಮ ಅರ್ಹತೆಯನ್ನು ನಿರ್ಧರಿಸುವುದಿಲ್ಲ.";
            } else if (language.startsWith("ta")) {
                answer = "பிரிவின்படி திட்டங்களைப் பார்த்து, தகுதி மற்றும் ஆவணங்களைச் சரிபார்க்கவும். காலக்கெடு மற்றும் விண்ணப்ப நிலையை அதிகாரப்பூர்வ அரசு இணையதளத்தில் பார்க்கவும். "
                        + "இந்த உதவியாளர் இறுதித் தகுதியை முடிவு செய்யாது.";
            } else {
                answer = "Explore schemes by category and check each scheme’s eligibility and required documents. For deadlines and application status, use the official government website. "
                        + "This assistant does not determine final eligibility.";
            }
            return new AssistantResponse(answer, false);
        }

        String prompt = "You are SchemeSaathi, a careful assistant helping Indian residents discover government schemes. "
                + "Reply in " + (request.language() == null ? "English" : request.language()) + ". "
                + "Give general, plain-language guidance only. Do not invent scheme details, deadlines, eligibility or links. "
                + "Direct users to verify all details with the official government portal. Do not request Aadhaar numbers, bank details, passwords or OTPs. "
                + "User question: " + request.question();
        Map<?, ?> response;
        try {
            response = restClient.post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}", model, apiKey)
                    .body(Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))))
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException exception) {
            int providerStatus = exception.getStatusCode().value();
            logger.error("Gemini API returned HTTP {} for model {}.", providerStatus, model);
            return new AssistantResponse(basicGuidance(request.language()), false);
        } catch (ResourceAccessException exception) {
            logger.error("Could not connect to the Gemini API for model {}.", model);
            return new AssistantResponse(basicGuidance(request.language()), false);
        }

        try {
            String text = extractText(response);
            return new AssistantResponse(text, true);
        } catch (IllegalStateException exception) {
            logger.error("Gemini returned an unreadable response for model {}.", model);
            return new AssistantResponse(basicGuidance(request.language()), false);
        }
    }

    private String basicGuidance(String language) {
        String normalized = language == null ? "" : language.toLowerCase(Locale.ROOT);
        if (normalized.startsWith("hi")) {
            return "श्रेणी के अनुसार योजनाएँ देखें और पात्रता व दस्तावेज़ जाँचें। समय-सीमा और आवेदन की स्थिति आधिकारिक सरकारी वेबसाइट पर देखें।";
        }
        if (normalized.startsWith("te")) {
            return "వర్గం ద్వారా పథకాలను చూడండి, అర్హత మరియు పత్రాలను పరిశీలించండి. గడువు మరియు దరఖాస్తు స్థితిని అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లో చూడండి.";
        }
        if (normalized.startsWith("kn")) {
            return "ವರ್ಗದ ಪ್ರಕಾರ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ, ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಗಡುವು ಮತ್ತು ಅರ್ಜಿ ಸ್ಥಿತಿಯನ್ನು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ನೋಡಿ.";
        }
        if (normalized.startsWith("ta")) {
            return "பிரிவின்படி திட்டங்களைப் பார்த்து தகுதி மற்றும் ஆவணங்களைச் சரிபார்க்கவும். காலக்கெடு மற்றும் விண்ணப்ப நிலையை அதிகாரப்பூர்வ அரசு இணையதளத்தில் பார்க்கவும்.";
        }
        return "Explore schemes by category and check each scheme’s eligibility and required documents. Confirm deadlines and application status on the linked official website.";
    }

    private String extractText(Map<?, ?> response) {
        if (response == null || !(response.get("candidates") instanceof List<?> candidates) || candidates.isEmpty()) {
            throw new IllegalStateException("The AI assistant returned an empty response.");
        }
        Object candidate = candidates.get(0);
        if (!(candidate instanceof Map<?, ?> candidateMap)
                || !(candidateMap.get("content") instanceof Map<?, ?> content)
                || !(content.get("parts") instanceof List<?> parts) || parts.isEmpty()
                || !(parts.get(0) instanceof Map<?, ?> firstPart)
                || !(firstPart.get("text") instanceof String text) || text.isBlank()) {
            throw new IllegalStateException("The AI assistant returned an unreadable response.");
        }
        return text;
    }
}
