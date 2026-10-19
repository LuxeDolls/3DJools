// Off for new orders. Existing crypto orders still use the addresses below.
export const CRYPTO_CHECKOUT_ENABLED = false

export type CryptoCoinId = "usdt_trc20" | "usdt_erc20" | "usdc_erc20" | "eth" | "btc"

export type CryptoCoinOption = {
  id: CryptoCoinId
  /** Ticker shown in the coin selector, e.g. "USDT". */
  coinLabel: string
  /** Network label shown next to the address, e.g. "TRC20 (Tron)". */
  network: string
  address: string
}

// Real receiving addresses — keep in sync with the wallets actually monitored for incoming payments.
export const CRYPTO_COIN_OPTIONS: CryptoCoinOption[] = [
  { id: "usdt_trc20", coinLabel: "USDT", network: "TRC20 (Tron)", address: "TUibzQ2LdR3E513RDqFhQW5ZPCMbddVD4Y" },
  {
    id: "usdt_erc20",
    coinLabel: "USDT",
    network: "ERC20 (Ethereum)",
    address: "0xdF4856E67f1498388C528D0B84374dBf14843AE2",
  },
  {
    id: "usdc_erc20",
    coinLabel: "USDC",
    network: "ERC20 (Ethereum)",
    address: "0xdF4856E67f1498388C528D0B84374dBf14843AE2",
  },
  { id: "eth", coinLabel: "ETH", network: "Ethereum", address: "0xdF4856E67f1498388C528D0B84374dBf14843AE2" },
  { id: "btc", coinLabel: "BTC", network: "Bitcoin", address: "bc1qmv46a6elus9z0j7cqx7gsnc4v2zd8gvy6xxumm" },
]

export const DEFAULT_CRYPTO_COIN_ID: CryptoCoinId = "usdt_trc20"

export function getCryptoCoinOption(id?: string | null): CryptoCoinOption {
  return CRYPTO_COIN_OPTIONS.find((option) => option.id === id) ?? CRYPTO_COIN_OPTIONS[0]
}

export function isCryptoCoinId(value: string): value is CryptoCoinId {
  return CRYPTO_COIN_OPTIONS.some((option) => option.id === value)
}
