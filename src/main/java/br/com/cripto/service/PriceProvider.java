package br.com.cripto.service;

import br.com.cripto.model.Asset;
import java.math.BigDecimal;

public interface PriceProvider {

    BigDecimal getCurrentPrice(Asset asset, String currency);
}
