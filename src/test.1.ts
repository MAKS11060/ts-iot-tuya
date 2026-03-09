import {test} from 'node:test'
import {clientId, clientSecret} from './config.ts'
import {Endpoint} from './constants.ts'
import {getToken} from './tuya/auth.ts'
import type {SuccessResponse} from './tuya/types.ts'
import {signRequest} from './tuya/utils.ts'

const token = await getToken({
  clientId: clientId,
  clientSecret: clientSecret,
})
const devPlug = process.env.DEV_1!
const devLight = process.env.DEV_2!

test('Test 030885', async (t) => {
  console.log(token)
})

test('Test 658764', async () => {
  // input
  const method = 'GET'
  const url = `/v2.0/cloud/thing/${devPlug}/state`

  const request = await signRequest(
    new Request(`${Endpoint.CentralEurope}${url}`, {method}),
    {clientId, clientSecret, accessToken: token.result.access_token},
  )

  const res = await fetch(request)
  console.log(await res.json())
})

// Smart Home Device Management
const getDeviceDetails = async (deviceId: string) => {
  const method = 'GET'
  const url = `/v1.0/devices/${deviceId}`

  const request = await signRequest(
    new Request(`${Endpoint.CentralEurope}${url}`, {method}),
    {clientId, clientSecret, accessToken: token.result.access_token},
  )

  const res = await fetch(request)
  return await res.json() as SuccessResponse<Record<string, unknown>>
}

const getDeviceStatus = async (deviceId: string) => {
  const method = 'GET'
  const url = `/v1.0/devices/${deviceId}/status`

  const request = await signRequest(
    new Request(`${Endpoint.CentralEurope}${url}`, {method}),
    {clientId, clientSecret, accessToken: token.result.access_token},
  )

  const res = await fetch(request)
  return await res.json() as SuccessResponse<Record<string, unknown>[]>
}

// Smart Home Device Control
const sendCommands = async (deviceId: string, data: any) => {
  const method = 'POST'
  const url = `/v1.0/devices/${deviceId}/commands`
  // const url = `/v1.0/iot-03/devices/${deviceId}/commands`

  const request = await signRequest(
    new Request(`${Endpoint.CentralEurope}${url}`, {
      method,
      body: JSON.stringify(data),
    }),
    {clientId, clientSecret, accessToken: token.result.access_token},
  )

  const res = await fetch(request)
  return await res.json() as SuccessResponse<boolean>
}

const getInstructionSetSupportedByDevice = async (deviceId: string) => {
  const [method, url] = ['GET', `/v1.0/devices/${deviceId}/functions`]

  const request = await signRequest(
    new Request(`${Endpoint.CentralEurope}${url}`, {method}),
    {clientId, clientSecret, accessToken: token.result.access_token},
  )

  const res = await fetch(request)
  return await res.json() as SuccessResponse<{
    category: string
    functions: {
      name: string
      desc: string
      code: string
      type: string
      values: string
    }[]
  }>
}

test('Test 961325', async (t) => {
  console.dir(
    await sendCommands(devPlug, {
      commands: [
        {code: 'switch_1', value: false},
      ],
    }),
    {depth: null},
  )
})

test('Test 65876411', async () => {
  console.dir(await getDeviceDetails(devPlug), {depth: null})
})

test('Test 658764111', async () => {
  console.dir(await getDeviceStatus(devPlug), {depth: null})
})

test('Test 975976', async (t) => {
  console.dir(await getInstructionSetSupportedByDevice(devPlug), {depth: null})
})

// light
test('Test 233389', async (t) => {
  console.dir(
    // await sendCommands(devLight, {commands: [{code: 'switch_led', value: true}]}),
    await sendCommands(devLight, {
      commands: [
        {code: 'switch_led', value: !true}, // true false
        // {code: 'bright_value', value: 200}, // 0..1000
        // {code: 'temp_value', value: 1000}, // 0..1000
      ],
    }),
    {depth: null},
  )
})

test('Test 5232532', async () => {
  console.dir(await getDeviceDetails(devLight), {depth: null})
})

test('Test 355971', async (t) => {
  console.dir(await getInstructionSetSupportedByDevice(devLight), {depth: null})
})
