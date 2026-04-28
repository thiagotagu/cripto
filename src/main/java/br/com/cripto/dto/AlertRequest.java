package br.com.cripto.dto;

import br.com.cripto.model.AlertDirection;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AlertRequest(
    @NotBlank String coingeckoId,
    @NotBlank String symbol,
    @NotBlank String name,
    @NotBlank String currency,
    @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal targetPrice,
    @NotNull AlertDirection direction,
    @NotBlank String whatsappNumber
) {
}
