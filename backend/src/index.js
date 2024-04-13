
const viem = require('viem')
const { Router } = require('cartesi-router')
const { Wallet, Error_out, Notice, Report } = require('cartesi-wallet')
const { 
  noticeHandler,
  reportHandler
 } = require('./utils/helpers')
const { 
  games, 
  reveal,
  commit,
  addParticipant, 
  addGame, 
  playGame,
  rollDice,
  updateBalance
} = require('./games')

const wallet = new Wallet(new Map())
const router = new Router(wallet)

const etherPortalAddress = '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044'
const dappAddressRelay = '0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE'
const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL
console.log('HTTP rollup_server url is ' + rollup_server)


async function handle_advance(data) {
  console.log('Received advance request data ' + JSON.stringify(data));


  const payload = data.payload;
  

  const msg_sender = data.metadata.msg_sender;
  console.log("msg sender is", msg_sender.toLowerCase());


    try {
      if ( msg_sender.toLowerCase() === etherPortalAddress.toLowerCase() ) {
        try {
          console.log('payment payload ', payload)
          const res = await router.process("ether_deposit", payload);
          console.log ('after payment payload ', res.payload)
          // const res = updateBalance(address, amount, gameId)
          // TODO: update the payment record
          return res

        } catch (e) {
          return new Error_out(`failed to process ether deposit ${payload} ${e}`);
        }
      } else if ( msg_sender.toLowerCase() === dappAddressRelay.toLowerCase()) {
        
        rollup_address = payload;
        router.set_rollup_address(rollup_address, "ether_withdraw");
        router.set_rollup_address(rollup_address, "erc20_withdraw");
        router.set_rollup_address(rollup_address, "erc721_withdraw");

        console.log("Setting DApp address");
        return new Notice( `DApp address set up successfully to ${rollup_address}` );
    }
      else {

        let JSONpayload = {};

        const payloadStr = viem.hexToString(payload);
        JSONpayload = JSON.parse(JSON.parse(payloadStr));
        console.log(`received request ${JSON.stringify(JSONpayload)}`);
        let advance_req;

  try {

    if (JSONpayload.method === 'withdraw') {
      
      try {
        const res = router.process('ether_withdraw', data)
        console.log('result from withraw ', res)
        return res
      } catch (error) {
       console.log(`Error occured trying to withdraw ${error}`)
       return new Error_out(`Error occured trying to withdraw ${error}`)
      }
      
    } else if (JSONpayload.method === 'transfer') {
      
      try {
        let res = wallet.ether_transfer(JSONpayload.from, JSONpayload.to, BigInt(JSONpayload.amount));
        // await fetch(rollup_server + "/notice", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ payload: notice.payload }),
        // });
        console.log('result after transfer ', res)
      } catch (error) {
        console.log("ERROR transfering");
        console.log(error);
        await reportHandler('ERROR transfering')
        return 'reject'
      }
      
      
  
    } else if (JSONpayload.method === 'createGame') {
      if (JSONpayload.data == '' || null) {
        console.log('Result cannot be empty');
        await reportHandler(message)
        return 'reject'
      }
  
      console.log('creating game...');
      const res = addGame(JSONpayload.data);
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
      advance_req = await noticeHandler(games);
  
  
    } else if (JSONpayload.method === 'addParticipant') {

      console.log('adding participant ...', JSONpayload.data);
      const res = addParticipant(JSONpayload.data)
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
      advance_req = await noticeHandler(games)

    } else if (JSONpayload.method === 'playGame') {
      
      console.log('game play ...', JSONpayload.data)
      const res = playGame(JSONpayload.data)
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
      advance_req = await noticeHandler(games)
    
    } else if (JSONpayload.method === 'rollDice') {
      
      console.log('rolling dice ...', JSONpayload.data)
      const res = rollDice(JSONpayload.data)
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
      advance_req = await noticeHandler(games)
    
    } else if (JSONpayload.method === 'commit') {
      console.log(`committing for ${msg_sender}...`)
      const res = commit(JSONpayload.gameId, JSONpayload.commitment, msg_sender.toLowerCase())
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
     
      advance_req = await noticeHandler(games)
    } else if(JSONpayload.method === 'reveal') {
      console.log(`reveaiing for ${msg_sender} ...`)
      const res = reveal(JSONpayload.gameId, JSONpayload.move, JSONpayload.nonce, msg_sender.toLowerCase())
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
     
      advance_req = await noticeHandler(games)
    } else {
      console.log('invalid request');
      const message = `method undefined: ${JSONpayload.method}`
      await reportHandler(message)
      return 'reject'
    }
  } catch (error) {
    await reportHandler(error)
    return 'reject'
  }

  const json = await advance_req?.json();
  
  console.log(`Received status ${advance_req?.status} with body ${JSON.stringify(json)}`)
  console.log('Game status ', JSON.stringify(games))

  return 'accept';
      }
    } catch (error) {
      return new Error_out(`failed to process ether deposti ${payload} ${error}`);
    }
 
}

async function handle_inspect(data) {
  console.log('Received inspect request data ' + JSON.stringify(data));
  try {
    const url = viem.hexToString(data.payload).split('/')

    const balance = url[0]
    const address = url[1]
    const gameId = url[2]

    return router.process(balance, address)


    // amount = wallet.balance_get(url[1]).ether_get()
    // const amountString = amount.toString();

    // console.log('retrieved bal ', amount)

    // const res = {
    //   address,
    //   gameId,
    //   amount 
    // }

    // await fetch(rollup_server + "/report", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ payload: viem.stringToHex(JSON.stringify(res)) }),
    // });
    
    // return new Report(`balance for ${address} for ${gameId} is ${viem.stringToHex(amountString)}`)

  } catch (error) {
    const error_msg = `failed to process inspect request ${error}`;
    console.debug(error_msg);
    return new Error_out(error_msg);
  }

}

const send_request = async (output) => {
  let endpoint = '/report'

  if (output.type === '/voucher') {
    endpoint = 'voucher'
  }

  await fetch(rollup_server + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(output),
    });
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: 'accept' };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + '/finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'accept' }),
    });

    console.log('Received finish status ' + finish_req.status);

    if (finish_req.status == 202) {
      console.log('No pending rollup request, trying again');
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req['request_type']];
      let output = await handler(rollup_req['data']);
      await send_request(output)
      finish.status = 'accept'
    }
  }
})();
