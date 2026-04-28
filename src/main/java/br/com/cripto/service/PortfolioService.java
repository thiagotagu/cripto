package br.com.cripto.service;

import br.com.cripto.dto.PortfolioPositionResponse;
import br.com.cripto.dto.PurchaseRequest;
import br.com.cripto.dto.PurchaseResponse;
import br.com.cripto.model.Asset;
import br.com.cripto.model.Purchase;
import br.com.cripto.repository.PurchaseRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortfolioService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PortfolioService.class);
    private static final int MONEY_SCALE = 8;

    private final AssetService assetService;
    private final PurchaseRepository purchaseRepository;
    private final PriceProvider priceProvider;

    public PortfolioService(AssetService assetService, PurchaseRepository purchaseRepository, PriceProvider priceProvider) {
        this.assetService = assetService;
        this.purchaseRepository = purchaseRepository;
        this.priceProvider = priceProvider;
    }

    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        Asset asset = assetService.findOrCreate(request.coingeckoId(), request.symbol(), request.name());
        Purchase purchase = new Purchase();
        purchase.setAsset(asset);
        purchase.setCurrency(request.currency().toUpperCase());
        purchase.setQuantity(request.quantity());
        purchase.setUnitPrice(request.unitPrice());
        purchase.setFees(request.fees());
        purchase.setPurchaseDate(request.purchaseDate());
        purchase.setNote(request.note());
        return toResponse(purchaseRepository.save(purchase));
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> listPurchases() {
        return purchaseRepository.findAllByOrderByPurchaseDateDesc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PortfolioPositionResponse> positions() {
        Map<String, List<Purchase>> grouped = purchaseRepository.findAll().stream()
            .collect(Collectors.groupingBy(purchase -> purchase.getAsset().getId() + ":" + purchase.getCurrency()));

        return grouped.values().stream()
            .map(this::toPosition)
            .toList();
    }

    private PortfolioPositionResponse toPosition(List<Purchase> purchases) {
        Purchase first = purchases.getFirst();
        Asset asset = first.getAsset();
        String currency = first.getCurrency();
        BigDecimal totalQuantity = purchases.stream()
            .map(Purchase::getQuantity)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalInvested = purchases.stream()
            .map(purchase -> purchase.getQuantity().multiply(purchase.getUnitPrice()).add(purchase.getFees()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averagePrice = totalInvested.divide(totalQuantity, MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal currentPrice = currentPriceOrZero(asset, currency);
        BigDecimal currentValue = currentPrice.multiply(totalQuantity).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal profitLoss = currentValue.subtract(totalInvested).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal profitLossPercent = totalInvested.compareTo(BigDecimal.ZERO) == 0
            ? BigDecimal.ZERO
            : profitLoss.multiply(BigDecimal.valueOf(100)).divide(totalInvested, 2, RoundingMode.HALF_UP);

        return new PortfolioPositionResponse(
            AssetService.toResponse(asset),
            currency,
            totalQuantity,
            totalInvested.setScale(MONEY_SCALE, RoundingMode.HALF_UP),
            averagePrice,
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercent
        );
    }

    private BigDecimal currentPriceOrZero(Asset asset, String currency) {
        try {
            return priceProvider.getCurrentPrice(asset, currency);
        } catch (RuntimeException exception) {
            LOGGER.warn("Falha ao buscar cotacao de {} em {}: {}", asset.getCoingeckoId(), currency, exception.getMessage());
            return BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        }
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        return new PurchaseResponse(
            purchase.getId(),
            AssetService.toResponse(purchase.getAsset()),
            purchase.getCurrency(),
            purchase.getQuantity(),
            purchase.getUnitPrice(),
            purchase.getFees(),
            purchase.getPurchaseDate(),
            purchase.getNote(),
            purchase.getCreatedAt()
        );
    }
}
