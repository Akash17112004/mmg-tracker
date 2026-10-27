package com.example.mmg.config;

import com.example.mmg.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Content-Disposition"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/superadmin/**").hasAnyRole("JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/items/*/documents").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/items/*/documents/**").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/items/*/documents").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/items/*/documents/*").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/items/*/documents/*").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/items/upload").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/items/*/assign").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/items/*/status").hasAnyRole("EMPLOYEE", "ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers("/api/items/*/document").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers("/api/items/*/history").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/items/*").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers("/api/meta/**").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "OIC_STORE", "BILLING")
                        .requestMatchers("/api/store/**").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "OIC_STORE", "BILLING")
                        .requestMatchers("/api/activity").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN", "EMPLOYEE")
                        .requestMatchers("/api/dashboard/employee/**").hasAnyRole("EMPLOYEE", "ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .requestMatchers("/api/employee/**").hasAnyRole("EMPLOYEE", "ADMIN", "JS_ADMIN", "DIRECTOR_ADMIN")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
