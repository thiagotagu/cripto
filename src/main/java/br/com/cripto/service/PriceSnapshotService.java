package br.com.cripto.service;

import br.com.cripto.model.Asset;
import br.com.cripto.model.PriceSnapshot;
import br.com.cripto.repository.PriceSnapshotRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PriceSnapshotService {

    private final PriceSnapshotRepository priceSnapshotRepository;

    public PriceSnapshotService(PriceSnapshotRepository priceSnapshotRepository) {
        this.priceSnapshotRepository = priceSnapshotRepository;
    }

    @Transactional
    public PriceSnapshot save(Asset asset, String currency, BigDecimal price) {
        PriceSnapshot snapshot = new PriceSnapshot();
        snapshot.setAsset(asset);
        snapshot.setCurrency(currency.toUpperCase());
        snapshot.setPrice(price);
        return priceSnapshotRepository.save(snapshot);
    }

    public List<PriceSnapshot> recent(Asset asset, String currency) {
        return priceSnapshotRepository.findTop30ByAssetAndCurrencyOrderByCapturedAtDesc(asset, currency.toUpperCase());
    }
}
