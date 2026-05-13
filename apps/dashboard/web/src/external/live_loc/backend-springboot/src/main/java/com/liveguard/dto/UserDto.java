package com.liveguard.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String phone;
    private Boolean isActive;
    private String lastLoginAt;
}
