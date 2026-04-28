package br.com.cripto.controller;

import br.com.cripto.dto.WalletTokenResponse;
import br.com.cripto.service.WalletTokenService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletTokenService walletTokenService;

    public WalletController(WalletTokenService walletTokenService) {
        this.walletTokenService = walletTokenService;
    }

    @GetMapping("/ethereum/{address}/tokens")
    public List<WalletTokenResponse> ethereumTokens(@PathVariable String address) {
        return walletTokenService.ethereumTokens(address);
    }
}
