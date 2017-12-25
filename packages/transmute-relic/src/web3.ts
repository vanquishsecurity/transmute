import { W3 } from 'soltsice'
import Web3 from 'web3'

declare var web3: any

// "web3": "^0.20.2"
export const getStable = () => {
  return new W3()
}

// "web3": "^1.0.0-beta.27"
export interface ITransmuteWeb3Config {
  providerUrl: string
}

export const getUnstable = (config: ITransmuteWeb3Config) => {
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider)
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider(config.providerUrl))
  }
  return web3
}

export const transmuteWeb3 = (config: ITransmuteWeb3Config, experimental = false) => {
  return experimental ? getUnstable(config) : getStable()
}