package in.schemesaathi.service;

import in.schemesaathi.dto.DocumentParseResponse;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DocumentService {
    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final Pattern INCOME = Pattern.compile("(?i)(?:annual\\s+family\\s+income|family\\s+income|annual\\s+income|income)\\s*[:\\-]?\\s*(?:rs\\.?|inr|₹)?\\s*([0-9][0-9,]*)");
    private static final Pattern AGE = Pattern.compile("(?i)\\bage\\s*[:\\-]?\\s*(\\d{1,3})\\b");

    public DocumentParseResponse parse(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a non-empty PDF or text file.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Files must be 5 MB or smaller.");
        }

        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String text;
        try {
            if (filename.endsWith(".pdf")) {
                try (var document = Loader.loadPDF(file.getBytes())) {
                    text = new PDFTextStripper().getText(document);
                }
            } else if (filename.endsWith(".txt")) {
                text = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            } else {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF and plain-text files are supported.");
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The document could not be read.", exception);
        }
        if (text.length() > 250_000) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "The extracted document text is too long to process.");
        }
        Long income = findNumber(INCOME, text).map(value -> {
            try {
                return Long.parseLong(value.replace(",", ""));
            } catch (NumberFormatException exception) {
                return null;
            }
        }).orElse(null);
        Integer age = findNumber(AGE, text).map(value -> {
            try {
                int parsed = Integer.parseInt(value);
                return parsed >= 1 && parsed <= 120 ? parsed : null;
            } catch (NumberFormatException exception) {
                return null;
            }
        }).orElse(null);
        return new DocumentParseResponse(text.length(), income, age,
                "Only possible age and income values were extracted. The file was processed in memory and was not saved.");
    }

    private java.util.Optional<String> findNumber(Pattern pattern, String text) {
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? java.util.Optional.of(matcher.group(1)) : java.util.Optional.empty();
    }
}
