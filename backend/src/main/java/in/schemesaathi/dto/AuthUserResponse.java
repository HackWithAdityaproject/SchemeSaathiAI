package in.schemesaathi.dto;

import in.schemesaathi.model.UserDocument;

public record AuthUserResponse(String id, String displayName, String email) {
    public static AuthUserResponse from(UserDocument user) {
        return new AuthUserResponse(user.id(), user.displayName(), user.email());
    }
}
