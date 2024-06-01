

import React, { useState } from 'react'
import { useSetChain } from '@web3-onboard/react'
import { ethers } from 'ethers'

import configFile from '../../config/cartesi.json'
import { parseEther } from 'ethers/lib/utils'
import Button from '../shared/Button'


const config: any = configFile
interface Report {
  payload: string
}

export const Balance: React.FC = () => {



  const [{ connectedChain }] = useSetChain()

  const inspectCall = async (payload: string) => {

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

    fetchData
      .then((response) => response.json())
      .then((res) => {
        console.log(res)
        res.reports.forEach((report: any) => {
          const decodedPayload = ethers.utils.toUtf8String(report.payload)

          const payloadJSON = JSON.parse(decodedPayload)
          console.log(payloadJSON)
          // if ()
        })

      })
  }


  return (
    <div>

    
      <Button
        onClick={
          () =>
            inspectCall('balance/0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65/d4754e97-a5ad-4eae-9c4d-5254c1d71f2a')
        }
      >
        Get Balance
      </Button>
    </div>
  )
}
