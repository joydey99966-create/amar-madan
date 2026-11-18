import { initialTransportRoutes } from '../data'
import { TransportMode, TransportRoute } from '../types'
import { recordsService } from './recordsService'

export const TRANSPORT_MODES: TransportMode[] = ['বাস', 'বোট', 'রিকশা', 'সিএনজি', 'মাইক্রোবাস']

export const transportService = {
  getRoutes(): TransportRoute[] {
    return recordsService.routes()
  },

  getByMode(mode: TransportMode): TransportRoute[] {
    return transportService.getRoutes().filter((route) => route.mode === mode)
  },
}
