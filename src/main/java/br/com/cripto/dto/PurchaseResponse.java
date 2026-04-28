package br.com.cripto.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PurchaseResponse(
    Long id,
    AssetResponse asset,
    String currency,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal fees,
    LocalDate purchaseDate,
    String note,
    Instant createdAt
) {
}
