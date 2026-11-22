package in.schemesaathi.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentServiceTest {
    private final DocumentService service = new DocumentService();

    @Test
    void extractsOnlyAgeAndIncomeFieldsWithoutReturningDocumentText() {
        var file = new MockMultipartFile(
                "file", "profile.txt", "text/plain",
                "Applicant age: 24\nAnnual family income: Rs. 1,25,000\nPrivate note: keep confidential".getBytes());

        var result = service.parse(file);

        assertThat(result.age()).isEqualTo(24);
        assertThat(result.annualIncome()).isEqualTo(125000L);
        assertThat(result.message()).contains("not saved");
    }
}
