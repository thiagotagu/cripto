package br.com.cripto.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI criptoOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cripto API")
                        .version("0.0.1")
                        .description("API para cotacao, carteira, alertas e previsoes de criptomoedas."));
    }
}
