package br.com.cripto.controller;

import br.com.cripto.dto.PredictionResponse;
import br.com.cripto.service.PredictionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping
    public PredictionResponse predict(@RequestParam String coingeckoId, @RequestParam(defaultValue = "USD") String currency) {
        return predictionService.predict(coingeckoId, currency);
    }
}
