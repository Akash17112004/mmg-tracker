package com.example.mmg.repository;

import com.example.mmg.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByRole_NameIgnoreCase(String roleName);
    List<User> findByRole_NameIgnoreCaseAndAssignedAdmin_Id(String roleName, Long adminId);
    List<User> findByAssignedAdmin_Id(Long adminId);

    @Query("SELECT u FROM User u WHERE u.role.name IN ('ADMIN', 'JS_ADMIN', 'DIRECTOR_ADMIN')")
    List<User> findAllAdmins();
}
