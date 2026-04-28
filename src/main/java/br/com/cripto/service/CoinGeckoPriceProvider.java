package br.com.cripto.service;

import br.com.cripto.model.Asset;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class CoinGeckoPriceProvider implements PriceProvider {

    private final RestClient restClient;
    private final String baseUrl;

    public CoinGeckoPriceProvider(RestClient restClient, @Value("${app.price.base-url}") String baseUrl) {
        this.restClient = restClient;
        this.baseUrl = baseUrl;
    }

    @Override
    public BigDecimal getCurrentPrice(Asset asset, String currency) {
        String normalizedCurrency = currency.toLowerCase();
        Map<String, Map<String, BigDecimal>> response = restClient.get()
            .uri(baseUrl + "/simple/price?ids={ids}&vs_currencies={currency}", asset.getCoingeckoId(), normalizedCurrency)
            .retrieve()
            .body(new ParameterizedTypeReference<>() {
            });

        if (response == null || !response.containsKey(asset.getCoingeckoId())) {
            throw new IllegalStateException("Cotacao nao encontrada para " + asset.getCoingeckoId());
        }

        BigDecimal price = response.get(asset.getCoingeckoId()).get(normalizedCurrency);
        if (price == null) {
            throw new IllegalStateException("Moeda nao suportada pela cotacao: " + currency);
        }
        return price;
    }
}
