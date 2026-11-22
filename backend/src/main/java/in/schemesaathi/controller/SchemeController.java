package in.schemesaathi.controller;

import in.schemesaathi.dto.MatchResult;
import in.schemesaathi.dto.ProfileRequest;
import in.schemesaathi.model.SchemeDocument;
import in.schemesaathi.service.SchemeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
public class SchemeController {
    private final SchemeService schemeService;

    public SchemeController(SchemeService schemeService) {
        this.schemeService = schemeService;
    }

    @GetMapping
    public List<SchemeDocument> schemes(@RequestParam(required = false) String category) {
        return schemeService.findAll(category);
    }

    @PostMapping
    public SchemeDocument create(@Valid @RequestBody SchemeDocument scheme) {
        return schemeService.create(scheme);
    }

    @PostMapping("/match")
    public List<MatchResult> match(@Valid @RequestBody ProfileRequest profile) {
        return schemeService.match(profile);
    }
}
