import BigNumber from 'bignumber.js'
import Web3 from 'web3'

const txo = (response?: any) => ({
  call: jest.fn(() => response),
  send: jest.fn(() => response),
  sendAndWaitForReceipt: jest.fn(() => response),
})

const GasPriceMinimum = {
  getGasPriceMinimum: jest.fn(async (address: string) => new BigNumber(10000)),
}

const StableToken = {
  balanceOf: jest.fn(async () => {
    return new BigNumber(1e18)
  }),
  decimals: jest.fn(async () => '18'),
  transferWithComment: jest.fn(async () => ({ txo: txo() })),
}

const GoldToken = {
  balanceOf: jest.fn(async () => new BigNumber(1e18)),
  decimals: jest.fn(async () => '18'),
  transferWithComment: jest.fn(async () => ({ txo: txo() })),
  approve: jest.fn(() => ({ txo: txo() })),
}

const Attestations = {
  getAttestationStat: jest.fn(),
}

const Accounts = {}

const TOBIN_TAX = { '0': '5000000000000000000000', '1': '1000000000000000000000000' } // Contract returns tuple representing fraction

const Reserve = {
  getOrComputeTobinTax: jest.fn(() => ({ txo: txo(TOBIN_TAX) })),
}

const Exchange = {
  getExchangeRate: jest.fn(() => new BigNumber(2)),
  exchange: jest.fn(),
}

const web3 = new Web3()

const connection = { web3: web3 }

const kit = {
  contracts: {
    getGasPriceMinimum: jest.fn(async () => GasPriceMinimum),
    getStableToken: jest.fn(async () => StableToken),
    getGoldToken: jest.fn(async () => GoldToken),
    getAttestations: jest.fn(async () => Attestations),
    getAccounts: jest.fn(async () => Accounts),
    getReserve: jest.fn(async () => Reserve),
    getExchange: jest.fn(async () => Exchange),
  },
  registry: {
    addressFor: async (address: string) => 1000,
  },
  connection,
}

export const newKitFromWeb3 = () => kit

export enum CeloContract {
  Accounts = 'Accounts',
  Attestations = 'Attestations',
  BlockchainParameters = 'BlockchainParameters',
  DoubleSigningSlasher = 'DoubleSigningSlasher',
  DowntimeSlasher = 'DowntimeSlasher',
  Election = 'Election',
  EpochRewards = 'EpochRewards',
  Escrow = 'Escrow',
  Exchange = 'Exchange',
  FeeCurrencyWhitelist = 'FeeCurrencyWhitelist',
  GasPriceMinimum = 'GasPriceMinimum',
  GoldToken = 'GoldToken',
  Governance = 'Governance',
  LockedGold = 'LockedGold',
  Random = 'Random',
  Registry = 'Registry',
  Reserve = 'Reserve',
  SortedOracles = 'SortedOracles',
  StableToken = 'StableToken',
  Validators = 'Validators',
}
