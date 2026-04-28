package br.com.cripto.dto;

import jakarta.validation.constraints.NotBlank;

public record AssetRequest(
    @NotBlank String coingeckoId,
    @NotBlank String symbol,
    @NotBlank String name
) {
}
