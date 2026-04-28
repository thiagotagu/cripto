package br.com.cripto.repository;

import br.com.cripto.model.Asset;
import br.com.cripto.model.Purchase;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByAssetOrderByPurchaseDateDesc(Asset asset);

    List<Purchase> findAllByOrderByPurchaseDateDesc();
}
