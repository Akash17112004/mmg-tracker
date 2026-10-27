package com.example.mmg.service;

import com.example.mmg.dto.AuthDtos.LoginRequest;
import com.example.mmg.dto.AuthDtos.LoginResponse;
import com.example.mmg.dto.AuthDtos.UpdateProfileRequest;
import com.example.mmg.entity.User;
import com.example.mmg.repository.UserRepository;
import com.example.mmg.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        org.springframework.security.core.Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getUsername(), user.getRole().getName());
    }

    public void updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Any change (username or password) requires confirming the current password first
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (request.newUsername() != null && !request.newUsername().isBlank()
                && !request.newUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.newUsername())) {
                throw new IllegalArgumentException("Username already taken: " + request.newUsername());
            }
            user.setUsername(request.newUsername());
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.newPassword()));
        }

        userRepository.save(user);
    }
}
