package br.com.cripto.repository;

import br.com.cripto.model.Asset;
import br.com.cripto.model.PriceSnapshot;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshot, Long> {

    List<PriceSnapshot> findTop30ByAssetAndCurrencyOrderByCapturedAtDesc(Asset asset, String currency);
}
