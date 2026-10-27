package com.example.mmg.config;

import com.example.mmg.entity.Role;
import com.example.mmg.entity.User;
import com.example.mmg.repository.RoleRepository;
import com.example.mmg.repository.UserRepository;
import com.example.mmg.repository.StoreCategoryRepository;
import com.example.mmg.entity.StoreCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class RoleInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final StoreCategoryRepository storeCategoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        for (String name : new String[]{"JS_ADMIN", "DIRECTOR_ADMIN", "ADMIN", "EMPLOYEE", "OIC_STORE", "BILLING"}) {
            roleRepository.findByName(name).orElseGet(() -> roleRepository.save(new Role(null, name)));
        }

        Role jsAdmin = roleRepository.findByName("JS_ADMIN").orElseThrow();
        Role employee = roleRepository.findByName("EMPLOYEE").orElseThrow();
        Role billing = roleRepository.findByName("BILLING").orElseThrow();

        // One-time compatibility migration for databases created before the role refresh.
        roleRepository.findByName("SUPER_ADMIN").ifPresent(oldRole -> {
            for (User user : userRepository.findByRole_NameIgnoreCase("SUPER_ADMIN")) {
                user.setRole(jsAdmin);
                userRepository.save(user);
            }
            userRepository.flush();
            roleRepository.delete(oldRole);
        });
        // Vendor accounts are no longer a separate access role; preserve their accounts without retaining vendor access.
        roleRepository.findByName("VENDOR").ifPresent(oldRole -> {
            for (User user : userRepository.findByRole_NameIgnoreCase("VENDOR")) {
                user.setRole(employee);
                userRepository.save(user);
            }
            userRepository.flush();
            roleRepository.delete(oldRole);
        });

        roleRepository.findByName("STORE").ifPresent(oldRole -> {
            for (User user : userRepository.findByRole_NameIgnoreCase("STORE")) {
                user.setRole(billing);
                userRepository.save(user);
            }
            userRepository.flush();
            roleRepository.delete(oldRole);
        });

        // Give legacy Store categories the standard three fields on first startup.
        for (StoreCategory category : storeCategoryRepository.findAll()) {
            if (category.getFields() == null || category.getFields().isEmpty()) {
                category.addField("Serial number", 0);
                category.addField("Specification", 1);
                category.addField("Remarks", 2);
                storeCategoryRepository.save(category);
            }
        }
    }
}
