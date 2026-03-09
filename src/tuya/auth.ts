import {Endpoint} from '../constants.ts'
import type {TokenSuccessResponse} from './types.ts'
import {makeRequest} from './utils.ts'

export const getToken = async (options: {
  clientId: string
  clientSecret: string
  region?: Endpoint
}) => {
  const url = '/v1.0/token?grant_type=1'
  const res = await makeRequest({url, cred: options, region: options.region})

  return await res.json() as TokenSuccessResponse
}
