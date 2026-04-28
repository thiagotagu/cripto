package br.com.cripto.dto;

public record WalletTokenResponse(
    String address,
    String name,
    String symbol,
    String balance,
    String priceUsd,
    String valueUsd
) {
}
