package com.liveguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LiveGuardApplication {
    public static void main(String[] args) {
        SpringApplication.run(LiveGuardApplication.class, args);
    }
}
