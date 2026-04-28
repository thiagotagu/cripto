package br.com.cripto.service;

import br.com.cripto.dto.PredictionResponse;

public interface PredictionService {

    PredictionResponse predict(String coingeckoId, String currency);
}
