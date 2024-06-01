import { ethers } from 'ethers'
import configFile from '../../config/cartesi.json'

const config: any = configFile

export const inspectCall = async (payload: string, connectedChain: any) => {
  if (!connectedChain) {
    return
  }

  let apiURL = ''

  if (config[connectedChain.id]?.inspectAPIURL) {
    apiURL = `${config[connectedChain.id].inspectAPIURL}/inspect`
  } else {
    console.error(
      `No inspect interface defined for chain ${connectedChain.id}`
    )
    return
  }

  let fetchData: Promise<Response>

  fetchData = fetch(`${apiURL}/${payload}`)

  try {
    const response = await fetchData
    const res = await response.json()
    return res.reports.map((report: any) => {
      const decodedPayload = ethers.utils.toUtf8String(report.payload)
      const payloadJSON = JSON.parse(decodedPayload)
      return payloadJSON
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}
