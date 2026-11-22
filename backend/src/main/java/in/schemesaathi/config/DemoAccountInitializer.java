package in.schemesaathi.config;

import in.schemesaathi.model.UserDocument;
import in.schemesaathi.repository.UserRepository;
import in.schemesaathi.service.UserAccountService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

@Configuration
@Profile("local")
public class DemoAccountInitializer {
    @Bean
    CommandLineRunner seedDemoAccount(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${app.auth.demo.email}") String email,
            @Value("${app.auth.demo.password}") String password) {
        return args -> {
            String normalizedEmail = UserAccountService.normalizeEmail(email);
            if (!users.existsById(normalizedEmail)) {
                users.save(new UserDocument(
                        normalizedEmail,
                        "Demo Citizen",
                        normalizedEmail,
                        passwordEncoder.encode(password),
                        Instant.now()));
            }
        };
    }
}
