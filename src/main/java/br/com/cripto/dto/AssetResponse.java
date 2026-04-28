package br.com.cripto.dto;

public record AssetResponse(
    Long id,
    String coingeckoId,
    String symbol,
    String name
) {
}
