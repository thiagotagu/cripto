package br.com.cripto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class CriptoApplication {

    public static void main(String[] args) {
        SpringApplication.run(CriptoApplication.class, args);
    }
}
