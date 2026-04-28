package br.com.cripto.service;

import br.com.cripto.dto.PredictionResponse;
import br.com.cripto.model.Asset;
import br.com.cripto.model.PriceSnapshot;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BasicPredictionService implements PredictionService {

    private final AssetService assetService;
    private final PriceProvider priceProvider;
    private final PriceSnapshotService priceSnapshotService;

    public BasicPredictionService(AssetService assetService, PriceProvider priceProvider, PriceSnapshotService priceSnapshotService) {
        this.assetService = assetService;
        this.priceProvider = priceProvider;
        this.priceSnapshotService = priceSnapshotService;
    }

    @Override
    public PredictionResponse predict(String coingeckoId, String currency) {
        Asset asset = assetService.getByCoingeckoId(coingeckoId);
        String normalizedCurrency = currency.toUpperCase();
        BigDecimal currentPrice = priceProvider.getCurrentPrice(asset, normalizedCurrency);
        priceSnapshotService.save(asset, normalizedCurrency, currentPrice);

        List<BigDecimal> prices = priceSnapshotService.recent(asset, normalizedCurrency).stream()
            .sorted(Comparator.comparing(PriceSnapshot::getCapturedAt))
            .map(PriceSnapshot::getPrice)
            .toList();

        BigDecimal dailyTrend = calculateTrend(prices);
        return new PredictionResponse(
            AssetService.toResponse(asset),
            normalizedCurrency,
            currentPrice,
            project(currentPrice, dailyTrend, 1),
            project(currentPrice, dailyTrend, 7),
            project(currentPrice, dailyTrend, 30),
            "Tendencia linear simples baseada nas ultimas amostras salvas.",
            "Previsao experimental. Nao e recomendacao financeira."
        );
    }

    private BigDecimal calculateTrend(List<BigDecimal> prices) {
        if (prices.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal first = prices.getFirst();
        BigDecimal last = prices.getLast();
        return last.subtract(first).divide(BigDecimal.valueOf(prices.size() - 1L), 8, RoundingMode.HALF_UP);
    }

    private BigDecimal project(BigDecimal currentPrice, BigDecimal dailyTrend, int days) {
        BigDecimal predicted = currentPrice.add(dailyTrend.multiply(BigDecimal.valueOf(days)));
        return predicted.max(BigDecimal.ZERO).setScale(8, RoundingMode.HALF_UP);
    }
}
