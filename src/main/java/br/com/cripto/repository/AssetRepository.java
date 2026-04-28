package br.com.cripto.repository;

import br.com.cripto.model.Asset;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByCoingeckoIdIgnoreCase(String coingeckoId);
}
