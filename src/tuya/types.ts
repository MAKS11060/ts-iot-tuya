export type SuccessResponse<T> = {
  result: T
  success: true
  t: number
  tid: string
}

export type TokenSuccessResponse = SuccessResponse<{
  access_token: string
  expire_time: number
  refresh_token: string
  uid: string
}>
