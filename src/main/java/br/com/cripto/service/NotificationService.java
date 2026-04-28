package br.com.cripto.service;

public interface NotificationService {

    void sendWhatsApp(String destination, String message);
}
