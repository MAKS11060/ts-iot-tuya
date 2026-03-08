import {clientId, clientSecret} from './config.ts'
import {Endpoint} from './constants.ts'

export interface TokenSuccessResponse {
  result: {
    access_token: string
    expire_time: number
    refresh_token: string
    uid: string
  }
  success: true
  t: number
  tid: string
}

const config = {
  accessKey: clientId,
  secretKey: clientSecret,
}

const enc = new TextEncoder()

export async function hmacSha256(data: string, secret: string): Promise<string> {
  const dataBuffer = enc.encode(data)
  const keyBuffer = enc.encode(secret)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer)
  return new Uint8Array(signature).toHex().toUpperCase()
}

export async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return new Uint8Array(hashBuffer).toHex()
}

export async function getToken() {
  const method = 'GET'
  const timestamp = Date.now().toString()
  const signUrl = '/v1.0/token?grant_type=1'
  const contentHash = await sha256('')
  const stringToSign = [method, contentHash, '', signUrl].join('\n')
  const signStr = config.accessKey + timestamp + stringToSign

  const headers = {
    t: timestamp,
    sign_method: 'HMAC-SHA256',
    client_id: config.accessKey,
    sign: await hmacSha256(signStr, config.secretKey),
  }

  const res = await fetch(`${Endpoint.CentralEurope}/v1.0/token?grant_type=1`, {headers})
  return await res.json() as TokenSuccessResponse
}

export const getBodyHash = async (request: Request) => {
  const body = await request.clone().bytes()
  const hash = await crypto.subtle.digest('SHA-256', body)
  return new Uint8Array(hash).toHex()
}

export const signRequest = async (request: Request, options: {
  clientId: string
  clientSecret: string
  accessToken: string
}) => {
  const t = Date.now().toString()

  const uri = new URL(request.url)
  uri.searchParams.sort()

  const contentHash = await getBodyHash(request)
  const stringToSign = [request.method, contentHash, '', uri.pathname].join('\n')
  const signStr = options.clientId + options.accessToken + t + stringToSign
  const sign = await hmacSha256(signStr, options.clientSecret)

  request.headers.set('t', t)
  request.headers.set('client_id', options.clientId)
  request.headers.set('sign', sign)
  request.headers.set('sign_method', 'HMAC-SHA256')
  request.headers.set('access_token', options.accessToken)
  request.headers.set('content-type', 'application/json')

  return request
}
