package in.schemesaathi.service;

import in.schemesaathi.dto.RegisterRequest;
import in.schemesaathi.model.UserDocument;
import in.schemesaathi.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserAccountServiceTest {
    @Test
    void normalizesEmailAndStoresOnlyAnEncodedPassword() {
        UserRepository repository = mock(UserRepository.class);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        when(repository.existsById("person@example.com")).thenReturn(false);
        when(repository.save(any(UserDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserAccountService service = new UserAccountService(repository, passwordEncoder);

        UserDocument account = service.register(
                new RegisterRequest("Example User", " Person@Example.com ", "testing-password"));

        assertThat(account.email()).isEqualTo("person@example.com");
        assertThat(account.passwordHash()).isNotEqualTo("testing-password");
        assertThat(passwordEncoder.matches("testing-password", account.passwordHash())).isTrue();
    }
}
