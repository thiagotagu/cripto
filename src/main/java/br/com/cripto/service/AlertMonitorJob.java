package br.com.cripto.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AlertMonitorJob {

    private static final Logger LOGGER = LoggerFactory.getLogger(AlertMonitorJob.class);

    private final AlertService alertService;

    public AlertMonitorJob(AlertService alertService) {
        this.alertService = alertService;
    }

    @Scheduled(fixedRateString = "${app.monitor.fixed-rate-ms}")
    public void monitor() {
        try {
            alertService.monitorActiveAlerts();
        } catch (RuntimeException exception) {
            LOGGER.warn("Falha ao monitorar alertas: {}", exception.getMessage());
        }
    }
}
