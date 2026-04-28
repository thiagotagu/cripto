const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Erro inesperado' }))
    throw new Error(body.message ?? 'Erro inesperado')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export type Asset = {
  id: number
  coingeckoId: string
  symbol: string
  name: string
}

export type Purchase = {
  id: number
  asset: Asset
  currency: string
  quantity: string
  unitPrice: string
  fees: string
  purchaseDate: string
  note?: string
  createdAt: string
}

export type PortfolioPosition = {
  asset: Asset
  currency: string
  totalQuantity: string
  totalInvested: string
  averagePrice: string
  currentPrice: string
  currentValue: string
  profitLoss: string
  profitLossPercent: string
}

export type Alert = {
  id: number
  asset: Asset
  currency: string
  targetPrice: string
  direction: 'ABOVE' | 'BELOW'
  whatsappNumber: string
  status: 'ACTIVE' | 'DISABLED' | 'TRIGGERED'
  lastCheckedPrice?: string
  lastCheckedAt?: string
  triggeredAt?: string
  createdAt: string
}

export type Prediction = {
  asset: Asset
  currency: string
  currentPrice: string
  predictedPrice1d: string
  predictedPrice7d: string
  predictedPrice30d: string
  method: string
  disclaimer: string
}

export type WalletToken = {
  address: string
  name: string
  symbol: string
  balance: string
  priceUsd?: string
  valueUsd?: string
}

export type PurchasePayload = {
  coingeckoId: string
  symbol: string
  name: string
  currency: string
  quantity: string
  unitPrice: string
  fees: string
  purchaseDate: string
  note: string
}

export type AlertPayload = {
  coingeckoId: string
  symbol: string
  name: string
  currency: string
  targetPrice: string
  direction: 'ABOVE' | 'BELOW'
  whatsappNumber: string
}

export const api = {
  positions: () => request<PortfolioPosition[]>('/portfolio/positions'),
  purchases: () => request<Purchase[]>('/portfolio/purchases'),
  createPurchase: (payload: PurchasePayload) =>
    request<Purchase>('/portfolio/purchases', { method: 'POST', body: JSON.stringify(payload) }),
  deletePurchase: (id: number) => request<void>(`/portfolio/purchases/${id}`, { method: 'DELETE' }),
  alerts: () => request<Alert[]>('/alerts'),
  createAlert: (payload: AlertPayload) =>
    request<Alert>('/alerts', { method: 'POST', body: JSON.stringify(payload) }),
  setAlertStatus: (id: number, status: Alert['status']) =>
    request<Alert>(`/alerts/${id}/status/${status}`, { method: 'PATCH' }),
  deleteAlert: (id: number) => request<void>(`/alerts/${id}`, { method: 'DELETE' }),
  predict: (coingeckoId: string, currency: string) =>
    request<Prediction>(`/predictions?coingeckoId=${encodeURIComponent(coingeckoId)}&currency=${encodeURIComponent(currency)}`),
  walletTokens: (address: string) => request<WalletToken[]>(`/wallet/ethereum/${encodeURIComponent(address)}/tokens`),
}
