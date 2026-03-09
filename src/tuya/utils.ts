import {Endpoint} from '../constants.ts'
import {hmacSha256} from '../lib/crypto.ts'

export const getBodyHash = async (request: Request) => {
  const body = await request.clone().bytes()
  const hash = await crypto.subtle.digest('SHA-256', body)
  return new Uint8Array(hash).toHex()
}

export const signRequest = async (request: Request, options: {
  clientId: string
  clientSecret: string
  accessToken?: string
}) => {
  const uri = new URL(request.url)
  uri.searchParams.sort()

  const timestamp = Date.now().toString()
  const contentHash = await getBodyHash(request)
  const stringToSign = [request.method, contentHash, '', uri.pathname + uri.search].join('\n')
  const signStr = `${options.clientId}${options?.accessToken || ''}${timestamp}${stringToSign}`
  const sign = await hmacSha256(signStr, options.clientSecret)

  request.headers.set('t', timestamp)
  request.headers.set('sign', sign.toUpperCase())
  request.headers.set('sign_method', 'HMAC-SHA256')
  request.headers.set('client_id', options.clientId)
  // optional for /token
  options.accessToken && request.headers.set('access_token', options.accessToken)

  request.headers.set('content-type', 'application/json') // mb remove

  return request
}

export const makeRequest = async (options: {
  method?: 'GET' | 'POST' | (string & {})
  url: string
  cred: Parameters<typeof signRequest>[1]
  body?: RequestInit['body']
  headers?: Request['headers']
  region?: Endpoint
}) => {
  const uri = new URL(options.url, options.region ?? Endpoint.CentralEurope)

  const req = await signRequest(
    new Request(uri, {
      method: options.method,
      headers: options.headers,
      body: options.body,
    }),
    options.cred,
  )

  const res = await fetch(req)
  return res
}
