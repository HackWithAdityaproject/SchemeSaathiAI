package in.schemesaathi.service;

import in.schemesaathi.dto.RegisterRequest;
import in.schemesaathi.model.UserDocument;
import in.schemesaathi.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Locale;

import static org.springframework.http.HttpStatus.CONFLICT;

@Service
public class UserAccountService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserAccountService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDocument register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (repository.existsById(email)) {
            throw new ResponseStatusException(CONFLICT, "An account with this email already exists.");
        }
        if (request.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords must be no more than 72 UTF-8 bytes.");
        }
        UserDocument user = new UserDocument(
                email,
                request.displayName().trim(),
                email,
                passwordEncoder.encode(request.password()),
                Instant.now());
        try {
            return repository.save(user);
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(CONFLICT, "An account with this email already exists.", exception);
        }
    }

    public UserDocument findByEmail(String email) {
        return repository.findById(normalizeEmail(email))
                .orElseThrow(() -> new UsernameNotFoundException("Account not found."));
    }

    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserDocument account = findByEmail(email);
        return User.withUsername(account.email())
                .password(account.passwordHash())
                .roles("USER")
                .build();
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
