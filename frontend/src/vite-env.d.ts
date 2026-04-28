/// <reference types="vite/client" />

type EthereumRequestArgs = {
  method: string
  params?: unknown[]
}

interface EthereumProvider {
  request<T = unknown>(args: EthereumRequestArgs): Promise<T>
  on?(event: 'accountsChanged' | 'chainChanged', callback: (...args: unknown[]) => void): void
  removeListener?(event: 'accountsChanged' | 'chainChanged', callback: (...args: unknown[]) => void): void
}

interface Window {
  ethereum?: EthereumProvider
}
