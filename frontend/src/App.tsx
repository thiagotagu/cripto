import { FormEvent, ReactNode, useEffect, useId, useMemo, useState } from 'react'
import { Alert, AlertPayload, api, PortfolioPosition, Prediction, Purchase, PurchasePayload, WalletToken } from './api'

const today = new Date().toISOString().slice(0, 10)

type AssetOption = {
  coingeckoId: string
  symbol: string
  name: string
}

type Tab = 'home' | 'alerts' | 'wallet'

type ChartPoint = {
  date: string
  price: number
}

type WalletState = {
  address: string
  chainId: string
  balance: string
  usdValue?: number
}

type NativeNetwork = {
  name: string
  symbol: string
  coingeckoId?: string
}

const assetOptions: AssetOption[] = [
  { coingeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { coingeckoId: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { coingeckoId: 'tether', symbol: 'USDT', name: 'Tether' },
  { coingeckoId: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { coingeckoId: 'solana', symbol: 'SOL', name: 'Solana' },
  { coingeckoId: 'ripple', symbol: 'XRP', name: 'XRP' },
  { coingeckoId: 'usd-coin', symbol: 'USDC', name: 'USDC' },
  { coingeckoId: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { coingeckoId: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { coingeckoId: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { coingeckoId: 'tron', symbol: 'TRX', name: 'TRON' },
  { coingeckoId: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { coingeckoId: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { coingeckoId: 'the-open-network', symbol: 'TON', name: 'Toncoin' },
  { coingeckoId: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { coingeckoId: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { coingeckoId: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { coingeckoId: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { coingeckoId: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
  { coingeckoId: 'aptos', symbol: 'APT', name: 'Aptos' },
]

const nativeNetworks: Record<string, NativeNetwork> = {
  '0x1': { name: 'Ethereum', symbol: 'ETH', coingeckoId: 'ethereum' },
  '0x38': { name: 'BNB Smart Chain', symbol: 'BNB', coingeckoId: 'binancecoin' },
  '0x89': { name: 'Polygon', symbol: 'MATIC', coingeckoId: 'matic-network' },
  '0xa86a': { name: 'Avalanche C-Chain', symbol: 'AVAX', coingeckoId: 'avalanche-2' },
  '0xa': { name: 'Optimism', symbol: 'ETH', coingeckoId: 'ethereum' },
  '0xa4b1': { name: 'Arbitrum One', symbol: 'ETH', coingeckoId: 'ethereum' },
  '0x2105': { name: 'Base', symbol: 'ETH', coingeckoId: 'ethereum' },
}

const initialPurchase: PurchasePayload = {
  coingeckoId: 'bitcoin',
  symbol: 'BTC',
  name: 'Bitcoin',
  currency: 'USD',
  quantity: '0.01',
  unitPrice: '65000',
  fees: '0',
  purchaseDate: today,
  note: '',
}

const initialAlert: AlertPayload = {
  coingeckoId: 'bitcoin',
  symbol: 'BTC',
  name: 'Bitcoin',
  currency: 'USD',
  targetPrice: '70000',
  direction: 'ABOVE',
  whatsappNumber: '+5500000000000',
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [btcChart, setBtcChart] = useState<ChartPoint[]>([])
  const [chartMessage, setChartMessage] = useState('')
  const [wallet, setWallet] = useState<WalletState | null>(null)
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([])
  const [walletMessage, setWalletMessage] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)
  const [purchaseForm, setPurchaseForm] = useState<PurchasePayload>(initialPurchase)
  const [alertForm, setAlertForm] = useState<AlertPayload>(initialAlert)
  const [predictionAsset, setPredictionAsset] = useState('bitcoin')
  const [predictionCurrency, setPredictionCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const totals = useMemo(() => {
    return positions.reduce(
      (acc, position) => ({
        invested: acc.invested + Number(position.totalInvested),
        current: acc.current + Number(position.currentValue),
        profit: acc.profit + Number(position.profitLoss),
      }),
      { invested: 0, current: 0, profit: 0 },
    )
  }, [positions])

  async function loadBtcChart() {
    setChartMessage('')
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily')
      if (!response.ok) {
        throw new Error('Nao foi possivel carregar o grafico do BTC')
      }
      const data = (await response.json()) as { prices: [number, number][] }
      setBtcChart(data.prices.map(([timestamp, price]) => ({ date: new Date(timestamp).toISOString().slice(5, 10), price })))
    } catch (error) {
      setChartMessage(error instanceof Error ? error.message : 'Erro ao carregar grafico do BTC')
    }
  }

  async function loadData() {
    setLoading(true)
    setMessage('')
    try {
      const [positionsData, purchasesData, alertsData] = await Promise.all([api.positions(), api.purchases(), api.alerts()])
      setPositions(positionsData)
      setPurchases(purchasesData)
      setAlerts(alertsData)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    void loadBtcChart()
  }, [])

  async function connectMetaMask() {
    const ethereum = window.ethereum
    if (!ethereum) {
      setWalletMessage('MetaMask nao encontrada. Instale a extensao ou abra em um navegador compativel.')
      return
    }

    setWalletLoading(true)
    setWalletMessage('')
    try {
      const accounts = await ethereum.request<string[]>({ method: 'eth_requestAccounts' })
      const [address] = accounts
      if (!address) {
        throw new Error('Nenhuma conta foi selecionada na MetaMask.')
      }
      await loadMetaMaskWallet(address)
    } catch (error) {
      setWalletMessage(error instanceof Error ? error.message : 'Erro ao conectar MetaMask')
    } finally {
      setWalletLoading(false)
    }
  }

  async function loadMetaMaskWallet(address: string) {
    const ethereum = window.ethereum
    if (!ethereum) {
      return
    }

    setWalletLoading(true)
    setWalletMessage('')
    try {
      const [chainId, balanceHex] = await Promise.all([
        ethereum.request<string>({ method: 'eth_chainId' }),
        ethereum.request<string>({ method: 'eth_getBalance', params: [address, 'latest'] }),
      ])
      const network = nativeNetworks[chainId] ?? { name: `Rede ${chainId}`, symbol: 'COIN' }
      const balance = formatWei(balanceHex)
      const usdPrice = network.coingeckoId ? await fetchUsdPrice(network.coingeckoId) : undefined
      const parsedBalance = Number(balance)
      const tokens = chainId === '0x1' ? await api.walletTokens(address) : []

      setWallet({
        address,
        chainId,
        balance,
        usdValue: usdPrice === undefined || Number.isNaN(parsedBalance) ? undefined : parsedBalance * usdPrice,
      })
      setWalletTokens(tokens)
      if (chainId !== '0x1') {
        setWalletMessage('A MetaMask nao entrega todos os tokens sozinha. No momento, a lista completa via indexador esta habilitada para Ethereum Mainnet.')
      }
    } catch (error) {
      setWalletMessage(error instanceof Error ? error.message : 'Erro ao carregar saldo da MetaMask')
    } finally {
      setWalletLoading(false)
    }
  }

  useEffect(() => {
    const ethereum = window.ethereum
    if (!ethereum?.on) {
      return
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const [address] = Array.isArray(accounts) ? accounts : []
      if (typeof address === 'string') {
        void loadMetaMaskWallet(address)
      } else {
        setWallet(null)
        setWalletTokens([])
      }
    }
    const handleChainChanged = () => {
      if (wallet?.address) {
        void loadMetaMaskWallet(wallet.address)
      }
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [wallet?.address])

  async function submitPurchase(event: FormEvent) {
    event.preventDefault()
    try {
      await api.createPurchase(normalizePurchasePayload(purchaseForm))
      setMessage('Compra registrada com sucesso.')
      await loadData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao registrar compra')
    }
  }

  async function submitAlert(event: FormEvent) {
    event.preventDefault()
    try {
      await api.createAlert(normalizeAlertPayload(alertForm))
      setMessage('Alerta criado com sucesso.')
      await loadData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar alerta')
    }
  }

  async function toggleAlert(alert: Alert) {
    const nextStatus = alert.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    await api.setAlertStatus(alert.id, nextStatus)
    await loadData()
  }

  async function removeAlert(id: number) {
    await api.deleteAlert(id)
    await loadData()
  }

  async function removePurchase(id: number) {
    await api.deletePurchase(id)
    setMessage('Compra excluida com sucesso.')
    await loadData()
  }

  async function requestPrediction(event: FormEvent) {
    event.preventDefault()
    try {
      setPrediction(await api.predict(predictionAsset, predictionCurrency))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao gerar previsao')
    }
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Projeto Cripto</p>
          <h1>Cotacao, carteira e alertas em um so lugar</h1>
          <p>Registre compras, acompanhe preco medio, monitore alvos e simule previsoes simples.</p>
        </div>
        <button onClick={loadData} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</button>
      </header>

      {message && <div className="message">{message}</div>}

      <nav className="tabs" aria-label="Navegacao principal">
        <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')}>Inicio</TabButton>
        <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')}>Alertas</TabButton>
        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')}>Carteira</TabButton>
      </nav>

      <section className="cards">
        <Metric label="Total investido" value={money(totals.invested)} />
        <Metric label="Valor atual" value={money(totals.current)} />
        <Metric label="Lucro / prejuizo" value={money(totals.profit)} highlight={totals.profit >= 0 ? 'positive' : 'negative'} />
      </section>

      {activeTab === 'home' && (
        <section className="grid">
          <Panel title="BTC nos ultimos 30 dias">
            <BtcChart data={btcChart} />
            {chartMessage && <p className="muted">{chartMessage}</p>}
            <button className="secondary" onClick={() => void loadBtcChart()}>Atualizar grafico</button>
          </Panel>

          <Panel title="Previsao">
            <form className="prediction-form" onSubmit={requestPrediction}>
              <AssetSearch
                label="Moeda"
                value={assetOptions.find((asset) => asset.coingeckoId === predictionAsset) ?? assetOptions[0]}
                onSelect={(asset) => setPredictionAsset(asset.coingeckoId)}
              />
              <input placeholder="Moeda de cotacao" value={predictionCurrency} onChange={(e) => setPredictionCurrency(e.target.value.toUpperCase())} />
              <button type="submit">Gerar previsao</button>
            </form>
            {prediction && (
              <div className="prediction">
                <strong>{prediction.asset.name}</strong>
                <span>Atual: {money(prediction.currentPrice)}</span>
                <span>1 dia: {money(prediction.predictedPrice1d)}</span>
                <span>7 dias: {money(prediction.predictedPrice7d)}</span>
                <span>30 dias: {money(prediction.predictedPrice30d)}</span>
                <small>{prediction.disclaimer}</small>
              </div>
            )}
          </Panel>
        </section>
      )}

      {activeTab === 'alerts' && (
        <section className="grid">
          <Panel title="Criar alerta">
            <form className="form" onSubmit={submitAlert}>
              <AssetFields value={alertForm} onChange={setAlertForm} />
              <MoneyInput label="Preco alvo" value={alertForm.targetPrice} onChange={(value) => setAlertForm({ ...alertForm, targetPrice: value })} />
              <select value={alertForm.direction} onChange={(e) => setAlertForm({ ...alertForm, direction: e.target.value as AlertPayload['direction'] })}>
                <option value="ABOVE">Quando subir ate o alvo</option>
                <option value="BELOW">Quando cair ate o alvo</option>
              </select>
              <input placeholder="WhatsApp" value={alertForm.whatsappNumber} onChange={(e) => setAlertForm({ ...alertForm, whatsappNumber: e.target.value })} />
              <button type="submit">Salvar alerta</button>
            </form>
          </Panel>

          <Panel title="Alertas">
            <div className="asset-list alert-list">
              <div className="asset-list-header">
                <span>Name</span>
                <span>Target</span>
                <span>Direction</span>
                <span>Status</span>
                <span>Last Price</span>
                <span>Actions</span>
              </div>
              {alerts.map((alert) => (
                <div className="asset-list-row" key={alert.id}>
                  <AssetNameCell name={alert.asset.name} symbol={alert.asset.symbol} />
                  <strong>{money(alert.targetPrice)}</strong>
                  <span className={alert.direction === 'ABOVE' ? 'positive' : 'negative'}>
                    {alert.direction === 'ABOVE' ? 'Acima' : 'Abaixo'}
                  </span>
                  <span className={`status-pill ${alert.status.toLowerCase()}`}>{alert.status}</span>
                  <span>{alert.lastCheckedPrice ? money(alert.lastCheckedPrice) : '-'}</span>
                  <div className="asset-actions">
                    <button className="icon-button" onClick={() => void toggleAlert(alert)} title={alert.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}>
                      {alert.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                    </button>
                    <button className="icon-button danger" onClick={() => void removeAlert(alert.id)} title="Excluir">Excluir</button>
                  </div>
                </div>
              ))}
              {!alerts.length && <p>Nenhum alerta cadastrado.</p>}
            </div>
          </Panel>
        </section>
      )}

      {activeTab === 'wallet' && (
        <>
          <section className="grid single">
            <Panel title="Carteira MetaMask">
              <div className="metamask-card">
                <div>
                  <p className="eyebrow">Web3 wallet</p>
                  <h3>Conecte sua MetaMask</h3>
                  <p className="muted">
                    A conexao mostra a rede atual, endereco e saldo da moeda nativa. Para listar todos os tokens ERC-20 automaticamente,
                    o proximo passo e integrar um indexador como Alchemy, Moralis ou Covalent.
                  </p>
                </div>
                <button onClick={() => void connectMetaMask()} disabled={walletLoading}>
                  {walletLoading ? 'Conectando...' : wallet ? 'Atualizar MetaMask' : 'Conectar MetaMask'}
                </button>
              </div>

              {walletMessage && <div className="message compact">{walletMessage}</div>}
            </Panel>
          </section>

          <section className="grid single">
            <Panel title="Carteira consolidada">
              <div className="asset-list wallet-list">
                <div className="asset-list-header">
                  <span>Name</span>
                  <span>Price</span>
                  <span>Holdings</span>
                  <span>Avg. Buy Price</span>
                  <span>Profit/Loss</span>
                  <span>Source</span>
                </div>
                {walletTokens.map((token) => (
                  <div className="asset-list-row" key={`metamask-${token.address}-${token.symbol}`}>
                    <AssetNameCell name={token.name} symbol={token.symbol} />
                    <span>{token.priceUsd ? money(token.priceUsd) : '-'}</span>
                    <div>
                      <strong>{token.valueUsd ? money(token.valueUsd) : '-'}</strong>
                      <small>{token.balance} {token.symbol}</small>
                    </div>
                    <span>-</span>
                    <span>-</span>
                    <span className="source-pill">MetaMask {wallet ? shortAddress(wallet.address) : ''}</span>
                  </div>
                ))}
                {wallet && walletTokens.length === 0 && (
                  <div className="asset-list-row">
                    <AssetNameCell name={getNativeNetwork(wallet.chainId).name} symbol={getNativeNetwork(wallet.chainId).symbol} />
                    <span>{wallet.usdValue === undefined || Number(wallet.balance) <= 0 ? '-' : money(wallet.usdValue / Number(wallet.balance))}</span>
                    <div>
                      <strong>{wallet.usdValue === undefined ? '-' : money(wallet.usdValue)}</strong>
                      <small>{wallet.balance} {getNativeNetwork(wallet.chainId).symbol}</small>
                    </div>
                    <span>-</span>
                    <span>-</span>
                    <span className="source-pill">MetaMask {shortAddress(wallet.address)}</span>
                  </div>
                )}
                {positions.map((position) => (
                  <div className="asset-list-row" key={`${position.asset.id}-${position.currency}`}>
                    <AssetNameCell name={position.asset.name} symbol={position.asset.symbol} />
                    <span>{money(position.currentPrice)}</span>
                    <div>
                      <strong>{money(position.currentValue)}</strong>
                      <small>{position.totalQuantity} {position.asset.symbol}</small>
                    </div>
                    <span>{money(position.averagePrice)}</span>
                    <div className={Number(position.profitLoss) >= 0 ? 'positive' : 'negative'}>
                      <strong>{money(position.profitLoss)}</strong>
                      <small>{position.profitLossPercent}%</small>
                    </div>
                    <span className="source-pill">Salvo</span>
                  </div>
                ))}
                {!positions.length && !wallet && !walletTokens.length && <p>Nenhuma posicao cadastrada.</p>}
              </div>
            </Panel>
          </section>

          <section className="grid">
            <Panel title="Registrar compra">
              <form className="form" onSubmit={submitPurchase}>
                <AssetFields value={purchaseForm} onChange={setPurchaseForm} />
                <NumberField label="Quantidade" value={purchaseForm.quantity} onChange={(value) => setPurchaseForm({ ...purchaseForm, quantity: value })} />
                <MoneyInput label="Preco unitario" value={purchaseForm.unitPrice} onChange={(value) => setPurchaseForm({ ...purchaseForm, unitPrice: value })} />
                <MoneyInput label="Taxas" value={purchaseForm.fees} onChange={(value) => setPurchaseForm({ ...purchaseForm, fees: value })} />
                <input type="date" value={purchaseForm.purchaseDate} onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })} />
                <input placeholder="Observacao" value={purchaseForm.note} onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })} />
                <button type="submit">Salvar compra</button>
              </form>
            </Panel>

            <Panel title="Historico de compras">
              <div className="asset-list purchase-list">
                <div className="asset-list-header">
                  <span>Name</span>
                  <span>Data</span>
                  <span>Quantidade</span>
                  <span>Preco unitario</span>
                  <span>Taxas</span>
                  <span>Actions</span>
                </div>
                {purchases.map((purchase) => (
                  <div className="asset-list-row" key={purchase.id}>
                    <AssetNameCell name={purchase.asset.name} symbol={purchase.asset.symbol} />
                    <span>{dateLabel(purchase.purchaseDate)}</span>
                    <span>{cryptoAmount(purchase.quantity)} {purchase.asset.symbol}</span>
                    <strong>{money(purchase.unitPrice)}</strong>
                    <span>{money(purchase.fees)}</span>
                    <div className="asset-actions">
                      <button className="icon-button danger" onClick={() => void removePurchase(purchase.id)} title="Excluir compra">Excluir</button>
                    </div>
                  </div>
                ))}
                {!purchases.length && <p>Nenhuma compra registrada.</p>}
              </div>
            </Panel>
          </section>
        </>
      )}
    </main>
  )
}

function AssetFields<T extends { coingeckoId: string; symbol: string; name: string; currency: string }>({
  value,
  onChange,
}: {
  value: T
  onChange: (value: T) => void
}) {
  const selectedAsset = assetOptions.find((asset) => asset.coingeckoId === value.coingeckoId) ?? {
    coingeckoId: value.coingeckoId,
    symbol: value.symbol,
    name: value.name,
  }

  return (
    <>
      <AssetSearch
        label="Moeda"
        value={selectedAsset}
        onSelect={(asset) => onChange({ ...value, coingeckoId: asset.coingeckoId, symbol: asset.symbol, name: asset.name })}
      />
      <input placeholder="Moeda de cotacao" value={value.currency} onChange={(e) => onChange({ ...value, currency: e.target.value.toUpperCase() })} />
    </>
  )
}

function AssetSearch({ label, value, onSelect }: { label: string; value: AssetOption; onSelect: (asset: AssetOption) => void }) {
  const listId = useId()
  const [query, setQuery] = useState(formatAsset(value))
  const [remoteOptions, setRemoteOptions] = useState<AssetOption[]>([])
  const options = useMemo(() => mergeAssetOptions(assetOptions, remoteOptions), [remoteOptions])

  useEffect(() => {
    setQuery(formatAsset(value))
  }, [value])

  useEffect(() => {
    const normalizedQuery = normalizeAssetQuery(query)
    if (normalizedQuery.length < 2 || options.some((asset) => normalizeAssetQuery(formatAsset(asset)) === normalizedQuery)) {
      return
    }

    const timeout = window.setTimeout(() => {
      void searchCoinGeckoAssets(query).then(setRemoteOptions)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [query, options])

  function selectAsset(asset: AssetOption) {
    setQuery(formatAsset(asset))
    onSelect(asset)
  }

  function handleChange(nextQuery: string) {
    setQuery(nextQuery)
    const normalizedQuery = normalizeAssetQuery(nextQuery)
    const match = options.find((asset) => {
      return [asset.coingeckoId, asset.symbol, asset.name, formatAsset(asset)].some((field) => normalizeAssetQuery(field) === normalizedQuery)
    })

    if (match) {
      onSelect(match)
    }
  }

  function handleBlur() {
    const normalizedQuery = normalizeAssetQuery(query)
    if (!normalizedQuery) {
      setQuery(formatAsset(value))
      return
    }
    const exactMatch = options.find((asset) => {
      return [asset.coingeckoId, asset.symbol, asset.name, formatAsset(asset)].some((field) => normalizeAssetQuery(field) === normalizedQuery)
    })
    const partialMatch = options.find((asset) => {
      return [asset.coingeckoId, asset.symbol, asset.name, formatAsset(asset)].some((field) => normalizeAssetQuery(field).includes(normalizedQuery))
    })
    const selected = exactMatch ?? partialMatch
    if (selected) {
      selectAsset(selected)
    }
  }

  return (
    <label className="field">
      <span>{label}</span>
      <input
        list={listId}
        placeholder="Pesquise por nome, simbolo ou CoinGecko ID"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
      />
      <datalist id={listId}>
        {options.map((asset) => (
          <option key={asset.coingeckoId} value={formatAsset(asset)} />
        ))}
      </datalist>
      <small>Selecionado: {value.name} ({value.symbol})</small>
    </label>
  )
}

function AssetNameCell({ name, symbol }: { name: string; symbol: string }) {
  return (
    <div className="asset-name-cell">
      <span className="asset-avatar">{symbol.slice(0, 1)}</span>
      <div>
        <strong>{name}</strong>
        <small>{symbol}</small>
      </div>
    </div>
  )
}

function MoneyInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const preview = normalizeDecimal(value)
  const parsed = Number(preview)

  return (
    <label className="field value-field">
      <span>{label}</span>
      <input inputMode="decimal" placeholder="0,00" value={value} onChange={(event) => onChange(event.target.value)} />
      <small>{Number.isFinite(parsed) && preview ? money(parsed) : 'Informe um valor em USD'}</small>
    </label>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const parsed = Number(normalizeDecimal(value))

  return (
    <label className="field value-field">
      <span>{label}</span>
      <input inputMode="decimal" placeholder="0,00000000" value={value} onChange={(event) => onChange(event.target.value)} />
      <small>{Number.isFinite(parsed) && value.trim() ? cryptoAmount(parsed) : 'Informe a quantidade comprada'}</small>
    </label>
  )
}

function BtcChart({ data }: { data: ChartPoint[] }) {
  if (!data.length) {
    return <div className="chart empty">Carregando grafico...</div>
  }

  const width = 720
  const height = 280
  const padding = 28
  const prices = data.map((point) => point.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const points = data.map((point, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - ((point.price - min) / range) * (height - padding * 2)
    return { ...point, x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const first = data[0]
  const last = data[data.length - 1]
  const variation = ((last.price - first.price) / first.price) * 100

  return (
    <div className="chart">
      <div className="chart-header">
        <div>
          <span>Bitcoin / USD</span>
          <strong>{money(last.price)}</strong>
        </div>
        <strong className={variation >= 0 ? 'positive' : 'negative'}>{variation.toFixed(2)}%</strong>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafico diario do Bitcoin nos ultimos 30 dias">
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        <path d={path} />
        {points.map((point) => (
          <circle key={`${point.date}-${point.price}`} cx={point.x} cy={point.y} r="3" />
        ))}
      </svg>
      <div className="chart-footer">
        <span>{first.date}</span>
        <span>{last.date}</span>
      </div>
    </div>
  )
}

function TabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button className={active ? 'tab active' : 'tab'} type="button" onClick={onClick}>
      {children}
    </button>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: 'positive' | 'negative' }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={highlight}>{value}</strong>
    </div>
  )
}

function money(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(Number(value))
}

function cryptoAmount(value: string | number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
  }).format(Number(value))
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

function normalizePurchasePayload(payload: PurchasePayload): PurchasePayload {
  return {
    ...payload,
    quantity: normalizeDecimal(payload.quantity),
    unitPrice: normalizeDecimal(payload.unitPrice),
    fees: normalizeDecimal(payload.fees),
  }
}

function normalizeAlertPayload(payload: AlertPayload): AlertPayload {
  return {
    ...payload,
    targetPrice: normalizeDecimal(payload.targetPrice),
  }
}

function normalizeDecimal(value: string) {
  return value.trim().replace(',', '.')
}

function getNativeNetwork(chainId: string) {
  return nativeNetworks[chainId] ?? { name: `Rede ${chainId}`, symbol: 'COIN' }
}

function formatWei(value: string) {
  const wei = BigInt(value)
  const base = 10n ** 18n
  const whole = wei / base
  const fraction = wei % base
  const fractionText = fraction.toString().padStart(18, '0').slice(0, 6).replace(/0+$/, '')
  return fractionText ? `${whole}.${fractionText}` : whole.toString()
}

async function fetchUsdPrice(coingeckoId: string) {
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coingeckoId)}&vs_currencies=usd`)
  if (!response.ok) {
    return undefined
  }
  const data = (await response.json()) as Record<string, { usd?: number }>
  return data[coingeckoId]?.usd
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatAsset(asset: AssetOption) {
  return `${asset.name} (${asset.symbol})`
}

function normalizeAssetQuery(value: string) {
  return value.trim().toLowerCase()
}

function mergeAssetOptions(localOptions: AssetOption[], remoteOptions: AssetOption[]) {
  const optionsById = new Map<string, AssetOption>()
  for (const asset of [...localOptions, ...remoteOptions]) {
    optionsById.set(asset.coingeckoId, asset)
  }
  return [...optionsById.values()]
}

async function searchCoinGeckoAssets(query: string): Promise<AssetOption[]> {
  const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)
  if (!response.ok) {
    return []
  }
  const data = (await response.json()) as { coins?: Array<{ id: string; name: string; symbol: string }> }
  return (data.coins ?? []).slice(0, 12).map((coin) => ({
    coingeckoId: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
  }))
}

export default App
