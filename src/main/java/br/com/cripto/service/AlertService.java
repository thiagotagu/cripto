package br.com.cripto.service;

import br.com.cripto.dto.AlertRequest;
import br.com.cripto.dto.AlertResponse;
import br.com.cripto.model.Alert;
import br.com.cripto.model.AlertDirection;
import br.com.cripto.model.AlertStatus;
import br.com.cripto.model.Asset;
import br.com.cripto.repository.AlertRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlertService {

    private final AssetService assetService;
    private final AlertRepository alertRepository;
    private final PriceProvider priceProvider;
    private final PriceSnapshotService priceSnapshotService;
    private final NotificationService notificationService;

    public AlertService(
        AssetService assetService,
        AlertRepository alertRepository,
        PriceProvider priceProvider,
        PriceSnapshotService priceSnapshotService,
        NotificationService notificationService
    ) {
        this.assetService = assetService;
        this.alertRepository = alertRepository;
        this.priceProvider = priceProvider;
        this.priceSnapshotService = priceSnapshotService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AlertResponse create(AlertRequest request) {
        Asset asset = assetService.findOrCreate(request.coingeckoId(), request.symbol(), request.name());
        Alert alert = new Alert();
        alert.setAsset(asset);
        alert.setCurrency(request.currency().toUpperCase());
        alert.setTargetPrice(request.targetPrice());
        alert.setDirection(request.direction());
        alert.setWhatsappNumber(request.whatsappNumber());
        return toResponse(alertRepository.save(alert));
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> list() {
        return alertRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public AlertResponse setStatus(Long id, AlertStatus status) {
        Alert alert = find(id);
        alert.setStatus(status);
        return toResponse(alert);
    }

    @Transactional
    public void delete(Long id) {
        alertRepository.delete(find(id));
    }

    @Transactional
    public void monitorActiveAlerts() {
        alertRepository.findByStatus(AlertStatus.ACTIVE).forEach(this::checkAlert);
    }

    private void checkAlert(Alert alert) {
        BigDecimal currentPrice = priceProvider.getCurrentPrice(alert.getAsset(), alert.getCurrency());
        alert.setLastCheckedPrice(currentPrice);
        alert.setLastCheckedAt(Instant.now());
        priceSnapshotService.save(alert.getAsset(), alert.getCurrency(), currentPrice);

        if (!isTriggered(alert, currentPrice)) {
            return;
        }

        alert.setStatus(AlertStatus.TRIGGERED);
        alert.setTriggeredAt(Instant.now());
        notificationService.sendWhatsApp(
            alert.getWhatsappNumber(),
            "Alerta de cripto: %s chegou em %s %s. Alvo: %s %s."
                .formatted(
                    alert.getAsset().getSymbol(),
                    currentPrice,
                    alert.getCurrency(),
                    alert.getTargetPrice(),
                    alert.getCurrency()
                )
        );
    }

    private boolean isTriggered(Alert alert, BigDecimal currentPrice) {
        if (alert.getDirection() == AlertDirection.ABOVE) {
            return currentPrice.compareTo(alert.getTargetPrice()) >= 0;
        }
        return currentPrice.compareTo(alert.getTargetPrice()) <= 0;
    }

    private Alert find(Long id) {
        return alertRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Alerta nao encontrado: " + id));
    }

    private AlertResponse toResponse(Alert alert) {
        return new AlertResponse(
            alert.getId(),
            AssetService.toResponse(alert.getAsset()),
            alert.getCurrency(),
            alert.getTargetPrice(),
            alert.getDirection(),
            alert.getWhatsappNumber(),
            alert.getStatus(),
            alert.getLastCheckedPrice(),
            alert.getLastCheckedAt(),
            alert.getTriggeredAt(),
            alert.getCreatedAt()
        );
    }
}
