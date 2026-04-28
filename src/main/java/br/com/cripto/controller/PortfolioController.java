package br.com.cripto.controller;

import br.com.cripto.dto.PortfolioPositionResponse;
import br.com.cripto.dto.PurchaseRequest;
import br.com.cripto.dto.PurchaseResponse;
import br.com.cripto.service.PortfolioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/purchases")
    public List<PurchaseResponse> purchases() {
        return portfolioService.listPurchases();
    }

    @PostMapping("/purchases")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseResponse createPurchase(@Valid @RequestBody PurchaseRequest request) {
        return portfolioService.createPurchase(request);
    }

    @GetMapping("/positions")
    public List<PortfolioPositionResponse> positions() {
        return portfolioService.positions();
    }
}
