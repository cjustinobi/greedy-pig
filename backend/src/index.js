
const { hexToString } = require('viem')
const { Router } = require('cartesi-router')
const { Wallet, Error_out, Notice, Report, Output } = require('cartesi-wallet')

const { 
  noticeHandler,
  reportHandler,
  etherPortalAddress,
  erc20PortalAddress,
  dappAddressRelay,
  dappAddress
 } = require('./utils')

const { 
  games, 
  reveal,
  commit,
  addParticipant, 
  addGame, 
  playGame,
  rollDice,
  getGame,
  getWinner
} = require('./games')

const wallet = new Wallet(new Map())
const router = new Router(wallet)

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL
console.log('HTTP rollup_server url is ' + rollup_server)

let rollup_address = ''
let advance_req


var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
}
var finish = { status: 'accept' }

const send_request = async (output) => {
  if (output instanceof Output) {
    let endpoint
    console.log('type of output', output.type)

    if (output.type == 'notice') {
      endpoint = '/report'
    } else if (output.type == 'voucher') {
      endpoint = '/voucher'
    } else {
      endpoint = '/report'
    }

    const response = await fetch(rollup_server + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(output),
    })
    console.debug(
      `received ${output.payload} status ${response.status} body ${JSON.stringify(response.body)}`
    )
  }
}

async function handle_advance(data) {
  console.log('Received advance request data ' + JSON.stringify(data))
  try {
    const payload = data.payload
    const msg_sender= data.metadata.msg_sender
    console.log('msg sender is', msg_sender.toLowerCase())
    const payloadStr = hexToString(payload)

    if (msg_sender.toLowerCase() === etherPortalAddress.toLowerCase()) {
      try {
        return router.process('ether_deposit', payload)
      } catch (e) {
        return new Error_out(`failed to process ether deposti ${payload} ${e}`)
      }
    }
    if (msg_sender.toLowerCase() === dappAddressRelay.toLowerCase()) {
      rollup_address = payload
      router.set_rollup_address(rollup_address, 'ether_withdraw')
      router.set_rollup_address(rollup_address, 'erc20_withdraw')
      router.set_rollup_address(rollup_address, 'erc721_withdraw')

      console.log('Setting DApp address')
      return new Notice(
        `DApp address set up successfully to ${rollup_address}`
      )
    }

    if (msg_sender.toLowerCase() === erc20PortalAddress.toLowerCase()) {
      try {
        const res = router.process('erc20_deposit', payload)
        console.log('res after depositing erc20 ', res.payload)
        const payloadStr = hexToString(res.payload)
        const JSONPayload = JSON.parse(payloadStr)
        console.log('erc20 payload ', JSONPayload)
        return res

      } catch (e) {
        return new Error_out(`failed to process ERC20Deposit ${payload} ${e}`)
      }
    }

    
    const JSONPayload = JSON.parse(payloadStr)
    console.log('payload is ', JSONPayload)

    if (JSONPayload.method === 'createGame') {
      if (JSONPayload.data == '' || null) {
        return new Error_out(`Data cannot be empty`)
      }

      if (JSONPayload.data.gameSettings.bet) {
        if (JSONPayload.args.to.toLowerCase() !== dappAddress) return new Error_out(`${msg_sender}: You are transfering to the wrong address`)
        // check that the amount is equal to the game amount
      }

      console.log('creating game...')

      try {
        const transferNotice = router.process('erc20_transfer', data)
  
        const res = await addGame(JSONPayload.data)
        if (res.error) {
          return new Error_out(`failed to add participant ${res.message}`)
        }
        advance_req = await noticeHandler(games)
        return transferNotice
      } catch (error) {
        return new Error_out(`failed to add participant ${error}`)
      }
  
    } else if (JSONPayload.method === 'addParticipant') {

      const game = getGame(JSONPayload.data.gameId)

      if (game.gameSettings.bet) {
        if (JSONPayload.args.to.toLowerCase() !== dappAddress) return new Error_out(`${msg_sender}: You are transfering to the wrong address`)
      }

      console.log('adding participant ...', JSONPayload.data)

      try {

        const transferNotice = router.process('erc20_transfer', data)
  
        const res = await addParticipant(JSONPayload.data)
        if (res.error) {
          return new Error_out(`failed to add participant ${res.message}`)
        }
  
        advance_req = await noticeHandler(games)

        return transferNotice

      } catch (error) {
        return new Error_out(`failed to add participant ${error}`)
      }


    } else if (JSONPayload.method === 'playGame') {
      
      console.log('game play ...', JSONPayload.data)
      const res = playGame(JSONPayload.data)
      if (res.error) {
        return new Error_out(`Failed to play game: ${JSONPayload.data}, ${res.message}`)
      }
      advance_req = await noticeHandler(games)
      return 'accept'
    
    } else if (JSONPayload.method === 'rollDice') {
      
      console.log('rolling dice ...', JSONPayload.data)
      const res = rollDice(JSONPayload.data)
      if (res.error) {
        return new Error_out(`Failed to roll dice: ${JSONPayload.data}, ${res.message}`)
      }

      advance_req = await noticeHandler(games)
      return 'accept'
    
    } else if (JSONPayload.method === 'commit') {
      console.log(`committing for ${msg_sender}...`)
      const res = commit(JSONPayload.gameId, JSONPayload.commitment, msg_sender.toLowerCase())
      if (res.error) {
        return new Error_out(`Failed to commit: ${JSONPayload}, ${res.message}`)
      }
     
      advance_req = await noticeHandler(games)
      return 'accept'

    } else if(JSONPayload.method === 'reveal') {
      console.log(`reveaiing for ${msg_sender} ...`)
      const res = reveal(JSONPayload.gameId, JSONPayload.move, JSONPayload.nonce, msg_sender.toLowerCase())
      if (res.error) {
        return new Error_out(`Failed to reveal: ${JSONPayload}, ${res.message}`)
      }
     
      advance_req = await noticeHandler(games)
      return 'accept'

    } else if(JSONPayload.method === 'paidOut') {
      const game = getGame(JSONPayload.gameId)
      game.paidOut = true

      if (res.error) {
        return new Error_out(`Failed to update game: ${JSONPayload}`)
      }
     
      advance_req = await noticeHandler(games)
      return 'accept'

    } else {

      console.log('router process payload ', data)

      if (JSONPayload.action === 'claim') {
        const game = getGame(JSONPayload.gameId)
        // TODO: handle transfered amount from here

        if (game.status === 'Ended' && game.winner.toLowerCase() === msg_sender.toLowerCase())
        data.metadata.msg_sender = dappAddress

      try {
        const resultNotice = router.process(JSONPayload.method, data)
        // if (resultNotice) {
          const winner = getWinner(JSONPayload.gameId)
          winner.fundClaimed = true
        // }


      } catch (e) {
        return new Error_out(`failed to process command ${payloadStr} ${e}`)
      }

      } else {
        try {
        return router.process(JSONPayload.method, data)
      } catch (e) {
        return new Error_out(`failed to process command ${payloadStr} ${e}`)
      }
      }
    }
    
  } catch (e) {
    console.error(e)
    return new Error_out(`failed to process advance_request ${e}`)
  }

}

async function handle_inspect(data) {
  console.debug(`received inspect request data${data.payload}`)
  try {
    const url = hexToString(data.payload).split('/')
    console.log('url is ', url)
    return router.process(url[0], url[1])
  } catch (e) {
    const error_msg = `failed to process inspect request ${e}`
    console.debug(error_msg)
    return new Error_out(error_msg)
  }
}


(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + '/finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'accept' }),
    })

    console.log('Received finish status ' + finish_req.status)

    if (finish_req.status == 202) {
      console.log('No pending rollup request, trying again')
    } else {
      const rollup_req = await finish_req.json()

      var typeq = rollup_req.request_type
      var handler
      if (typeq === 'inspect_state') {
        handler = handlers.inspect_state
      } else {
        handler = handlers.advance_state
      }
      var output = await handler(rollup_req.data)
      finish.status = 'accept'
      if (output instanceof Error_out) {
        finish.status = 'reject'
      }

      console.log('Games ', JSON.stringify(games))
  
      await send_request(output)
    }
  }
})()