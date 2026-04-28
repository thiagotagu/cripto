package br.com.cripto.dto;

import java.math.BigDecimal;

public record PredictionResponse(
    AssetResponse asset,
    String currency,
    BigDecimal currentPrice,
    BigDecimal predictedPrice1d,
    BigDecimal predictedPrice7d,
    BigDecimal predictedPrice30d,
    String method,
    String disclaimer
) {
}
