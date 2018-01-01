// import { UnsafeEventStore } from "../TransmuteContracts/UnsafeEventStore";
// import { RBACEventStore } from "../TransmuteContracts/RBACEventStore";
import { EventStore } from '../TransmuteContracts/EventStore'

import { W3 } from 'soltsice'

import { Utils } from '../Utils'
import { EventStoreAdapter } from './EventStoreAdapter'

import { IFSA } from './EventTypes'

import * as EventTransformer from '../Utils/EventTransformer'

export const GAS_COSTS = {
  WRITE_EVENT: 4000000
}

export namespace Store {
  /**
   * Store eventCount
   */
  export const eventCount = async (store: EventStore, web3: any, fromAddress: string) => {
    let countBigNumber = await store.eventCount(W3.TC.txParamsDefaultDeploy(fromAddress))
    return countBigNumber.toNumber()
  }

  /**
   * Store readFSA
   */
  export const readFSA = async (
    store: EventStore,
    eventStoreAdapter: EventStoreAdapter,
    web3: any,
    fromAddress: string,
    eventId: number
  ) => {
    // move this to eventStoreAdapter....
    let solidityValues: any = await store.readEvent(
      eventId,
      W3.TC.txParamsDefaultDeploy(fromAddress)
    )
    let esEvent = await EventTransformer.valuesToEsEvent(
      solidityValues[0],
      solidityValues[1],
      solidityValues[2],
      solidityValues[3],
      solidityValues[4],
      solidityValues[5],
      solidityValues[6],
      solidityValues[7],
      solidityValues[8]
    )
    return eventStoreAdapter.eventMap.EsEvent(esEvent)
  }

  /**
   * Store writeFSA
   */
  export const writeFSA = async (
    store: EventStore,
    eventStoreAdapter: EventStoreAdapter,
    web3: any,
    fromAddress: string,
    event: IFSA
  ): Promise<IFSA> => {
    if (typeof event.payload === 'string') {
      throw new Error('event.payload must be an object, not a string.')
    }

    if (Array.isArray(event.payload)) {
      throw new Error('event.payload must be an object, not an array.')
    }

    return eventStoreAdapter.writeFSA(store, fromAddress, event)
  }

  export const writeFSAs = async (
    store: EventStore,
    eventStoreAdapter: EventStoreAdapter,
    web3: any,
    fromAddress: string,
    events: IFSA[]
  ): Promise<IFSA[]> => {
    return Promise.all(
      events.map(event => {
        return writeFSA(store, eventStoreAdapter, web3, fromAddress, event)
      })
    )
  }

  export const readFSAs = async (
    store: EventStore,
    eventStoreAdapter: EventStoreAdapter,
    web3: any,
    fromAddress: string,
    eventIndex: number = 0
  ): Promise<IFSA[]> => {
    let endIndex: number = await eventCount(store, web3, fromAddress)
    let events = []
    for (let i: number = eventIndex; i < endIndex; i++) {
      events.push(await readFSA(store, eventStoreAdapter, web3, fromAddress, i))
    }
    return Promise.all(events)
  }
}