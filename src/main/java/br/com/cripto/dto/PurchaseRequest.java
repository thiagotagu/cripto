package br.com.cripto.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseRequest(
    @NotBlank String coingeckoId,
    @NotBlank String symbol,
    @NotBlank String name,
    @NotBlank String currency,
    @NotNull @DecimalMin(value = "0.000000000001") BigDecimal quantity,
    @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal unitPrice,
    @NotNull @DecimalMin("0.0") BigDecimal fees,
    @NotNull LocalDate purchaseDate,
    String note
) {
}
