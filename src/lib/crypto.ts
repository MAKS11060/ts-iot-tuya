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

export async function sha256(message: string): Promise<string> {
  const msgBuffer = enc.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return new Uint8Array(hashBuffer).toHex()
}
