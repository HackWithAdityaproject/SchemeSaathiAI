package in.schemesaathi.controller;

import in.schemesaathi.dto.AssistantRequest;
import in.schemesaathi.dto.AssistantResponse;
import in.schemesaathi.service.AssistantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {
    private final AssistantService assistantService;

    public AssistantController(AssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping
    public AssistantResponse answer(@Valid @RequestBody AssistantRequest request) {
        return assistantService.answer(request);
    }
}
