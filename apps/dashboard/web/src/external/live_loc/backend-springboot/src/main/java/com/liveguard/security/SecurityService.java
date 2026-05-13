package com.liveguard.security;
import com.liveguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecurityService {
    private final UserRepository userRepository;
    public boolean isCurrentUser(UUID userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).map(u -> u.getId().equals(userId)).orElse(false);
    }
}