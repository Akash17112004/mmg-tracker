package com.example.mmg.service;

import com.example.mmg.entity.Category;
import com.example.mmg.entity.Role;
import com.example.mmg.entity.User;
import com.example.mmg.repository.CategoryRepository;
import com.example.mmg.repository.RoleRepository;
import com.example.mmg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String username, String rawPassword, String roleName, Long explicitAdminId, User creator) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }

        String normalizedRole = roleName.toUpperCase();
        boolean creatorIsSuperAdmin = (creator.getRole().getName().equalsIgnoreCase("JS_ADMIN") || creator.getRole().getName().equalsIgnoreCase("DIRECTOR_ADMIN"));

        // Only an executive admin may create executive or Store staff accounts
        if ((normalizedRole.equals("JS_ADMIN") || normalizedRole.equals("DIRECTOR_ADMIN") || normalizedRole.equals("OIC_STORE") || normalizedRole.equals("BILLING")) && !creatorIsSuperAdmin) {
            throw new SecurityException("Only an executive admin can create executive or Store staff accounts");
        }

        Role role = roleRepository.findByName(normalizedRole)
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + roleName));

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);

        if (normalizedRole.equals("EMPLOYEE")) {
            if (creatorIsSuperAdmin) {
                // JS_ADMIN can explicitly pick the owning admin; otherwise it's left unassigned for later
                if (explicitAdminId != null) {
                    User owningAdmin = userRepository.findById(explicitAdminId)
                            .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + explicitAdminId));
                    user.setAssignedAdmin(owningAdmin);
                }
            } else {
                // A regular admin's new employees are automatically theirs
                user.setAssignedAdmin(creator);
            }
        }

        return userRepository.save(user);
    }

    public Category createCategory(String name) {
        Category category = new Category();
        category.setName(name);
        return categoryRepository.save(category);
    }

    public void resetPassword(Long targetUserId, String newPassword, User actingAdmin) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + targetUserId));

        boolean actorIsSuperAdmin = (actingAdmin.getRole().getName().equalsIgnoreCase("JS_ADMIN") || actingAdmin.getRole().getName().equalsIgnoreCase("DIRECTOR_ADMIN"));
        String targetRole = target.getRole().getName();

        if (!actorIsSuperAdmin) {
            // A regular admin may only reset passwords for employees they own
            if (!targetRole.equalsIgnoreCase("EMPLOYEE")
                    || target.getAssignedAdmin() == null
                    || !target.getAssignedAdmin().getId().equals(actingAdmin.getId())) {
                throw new SecurityException("You can only reset passwords for your own employees");
            }
        }

        target.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(target);
    }
}
