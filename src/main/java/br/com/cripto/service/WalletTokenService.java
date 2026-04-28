package br.com.cripto.service;

import br.com.cripto.dto.WalletTokenResponse;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WalletTokenService {

    private final RestClient restClient;
    private final String ethplorerBaseUrl;

    public WalletTokenService(RestClient restClient, @Value("${app.wallet.ethplorer-base-url}") String ethplorerBaseUrl) {
        this.restClient = restClient;
        this.ethplorerBaseUrl = ethplorerBaseUrl;
    }

    public List<WalletTokenResponse> ethereumTokens(String address) {
        Map<String, Object> response = restClient.get()
            .uri(ethplorerBaseUrl + "/getAddressInfo/{address}?apiKey=freekey", address)
            .retrieve()
            .body(new ParameterizedTypeReference<>() {
            });

        if (response == null) {
            return List.of();
        }

        List<WalletTokenResponse> tokens = new ArrayList<>();
        addNativeEth(response, tokens);
        addErc20Tokens(response, tokens);
        return tokens;
    }

    @SuppressWarnings("unchecked")
    private static void addNativeEth(Map<String, Object> response, List<WalletTokenResponse> tokens) {
        Object ethValue = response.get("ETH");
        if (!(ethValue instanceof Map<?, ?> eth)) {
            return;
        }

        BigDecimal balance = decimal(eth.get("balance"));
        BigDecimal price = priceFrom(eth);
        tokens.add(new WalletTokenResponse(
            "native",
            "Ethereum",
            "ETH",
            format(balance),
            price == null ? null : format(price),
            price == null ? null : format(balance.multiply(price))
        ));
    }

    @SuppressWarnings("unchecked")
    private static void addErc20Tokens(Map<String, Object> response, List<WalletTokenResponse> tokens) {
        Object tokenListValue = response.get("tokens");
        if (!(tokenListValue instanceof List<?> tokenList)) {
            return;
        }

        for (Object value : tokenList) {
            if (!(value instanceof Map<?, ?> token)) {
                continue;
            }
            Object tokenInfoValue = token.get("tokenInfo");
            if (!(tokenInfoValue instanceof Map<?, ?> tokenInfo)) {
                continue;
            }

            String address = string(tokenInfo.get("address"));
            String name = string(tokenInfo.get("name"));
            String symbol = string(tokenInfo.get("symbol"));
            int decimals = integer(tokenInfo.get("decimals"), 18);
            BigDecimal balance = tokenBalance(string(token.get("balance")), decimals);
            if (balance.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal price = priceFrom(tokenInfo);
            tokens.add(new WalletTokenResponse(
                address,
                name.isBlank() ? symbol : name,
                symbol.isBlank() ? "TOKEN" : symbol,
                format(balance),
                price == null ? null : format(price),
                price == null ? null : format(balance.multiply(price))
            ));
        }
    }

    private static BigDecimal tokenBalance(String rawBalance, int decimals) {
        if (rawBalance.isBlank()) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(new BigInteger(rawBalance)).movePointLeft(decimals);
    }

    private static BigDecimal priceFrom(Map<?, ?> value) {
        Object priceValue = value.get("price");
        if (!(priceValue instanceof Map<?, ?> price)) {
            return null;
        }
        BigDecimal rate = decimal(price.get("rate"));
        return rate.compareTo(BigDecimal.ZERO) > 0 ? rate : null;
    }

    private static String string(Object value) {
        return value == null ? "" : value.toString();
    }

    private static int integer(Object value, int fallback) {
        try {
            return Integer.parseInt(string(value));
        } catch (NumberFormatException exception) {
            return fallback;
        }
    }

    private static BigDecimal decimal(Object value) {
        if (value == null || string(value).isBlank()) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(string(value));
    }

    private static String format(BigDecimal value) {
        return value.setScale(8, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
    }
}
