package br.com.cripto.dto;

import br.com.cripto.model.AlertDirection;
import br.com.cripto.model.AlertStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record AlertResponse(
    Long id,
    AssetResponse asset,
    String currency,
    BigDecimal targetPrice,
    AlertDirection direction,
    String whatsappNumber,
    AlertStatus status,
    BigDecimal lastCheckedPrice,
    Instant lastCheckedAt,
    Instant triggeredAt,
    Instant createdAt
) {
}
