package br.com.cripto.dto;

import java.math.BigDecimal;

public record PortfolioPositionResponse(
    AssetResponse asset,
    String currency,
    BigDecimal totalQuantity,
    BigDecimal totalInvested,
    BigDecimal averagePrice,
    BigDecimal currentPrice,
    BigDecimal currentValue,
    BigDecimal profitLoss,
    BigDecimal profitLossPercent
) {
}
