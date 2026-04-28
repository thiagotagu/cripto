package br.com.cripto.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoggingNotificationService implements NotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingNotificationService.class);

    @Override
    public void sendWhatsApp(String destination, String message) {
        LOGGER.info("WhatsApp simulado para {}: {}", destination, message);
    }
}
