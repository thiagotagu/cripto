package br.com.cripto.service;

import br.com.cripto.dto.AssetResponse;
import br.com.cripto.model.Asset;
import br.com.cripto.repository.AssetRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Transactional
    public Asset findOrCreate(String coingeckoId, String symbol, String name) {
        return assetRepository.findByCoingeckoIdIgnoreCase(normalize(coingeckoId))
            .orElseGet(() -> {
                Asset asset = new Asset();
                asset.setCoingeckoId(normalize(coingeckoId));
                asset.setSymbol(symbol.toUpperCase());
                asset.setName(name);
                return assetRepository.save(asset);
            });
    }

    public Asset getByCoingeckoId(String coingeckoId) {
        return assetRepository.findByCoingeckoIdIgnoreCase(normalize(coingeckoId))
            .orElseThrow(() -> new IllegalArgumentException("Criptomoeda nao cadastrada: " + coingeckoId));
    }

    public List<AssetResponse> list() {
        return assetRepository.findAll().stream()
            .map(AssetService::toResponse)
            .toList();
    }

    public static AssetResponse toResponse(Asset asset) {
        return new AssetResponse(asset.getId(), asset.getCoingeckoId(), asset.getSymbol(), asset.getName());
    }

    private static String normalize(String value) {
        return value.trim().toLowerCase();
    }
}
