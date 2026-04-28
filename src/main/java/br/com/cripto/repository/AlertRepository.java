package br.com.cripto.repository;

import br.com.cripto.model.Alert;
import br.com.cripto.model.AlertStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByStatus(AlertStatus status);
}
