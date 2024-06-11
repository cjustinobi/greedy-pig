
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
  transferToWinner
} = require('./games')

const wallet = new Wallet(new Map())
const router = new Router(wallet)

const etherPortalAddress = '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044'
const erc20PortalAddress = '0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB'
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
          // const res = await router.process("ether_deposit", payload);
          notice = wallet.ether_deposit_process(payload)
       
          console.log('notice payload after deposit ', notice.payload)
          return 'accept'

        } catch (e) {
          return new Error_out(`failed to process ether deposit ${payload} ${e}`);
        }
      } else if ( msg_sender.toLowerCase() === erc20PortalAddress.toLowerCase() ) {
        try {
          
          notice = wallet.erc20_deposit_process(payload)
       
          console.log('notice payload after erc20 deposit ', notice.payload)
          return 'accept'

        } catch (e) {
          return new Error_out(`failed to process ether deposit ${payload} ${e}`);
        }
      } else if ( msg_sender.toLowerCase() === dappAddressRelay.toLowerCase()) {
        
        rollup_address = payload;
        router.set_rollup_address(rollup_address, "ether_withdraw");
        router.set_rollup_address(rollup_address, "erc20_withdraw");
        router.set_rollup_address(rollup_address, "erc721_withdraw");

        console.log("Setting DApp address");
        return new Report( `DApp address set up successfully to ${rollup_address}` );
    }
      else {

        let JSONpayload = {};

        const payloadStr = viem.hexToString(payload);
        JSONpayload = JSON.parse(JSON.parse(payloadStr));
        console.log(`received request ${JSON.stringify(JSONpayload)}`);
        let advance_req;

  try {

    if (JSONpayload.method === 'withdraw') {
// ether_withdraw: (rollup_address: Address, account: Address, amount: bigint) => Voucher | Error_out;
      try {
    let voucher = wallet.ether_withdraw(
      JSONpayload.rollupAddress,
      JSONpayload.to,
      viem.parseEther((JSONpayload.amount).toString())
    );
    const res = await fetch(rollup_server + "/voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: voucher.payload, destination: voucher.destination }),
    });
    console.log('voucher ', res)
    return res
  } catch (error) {
    console.log("voucher ERROR");
    console.log(error);
  }
      

      
    } else if (JSONpayload.method === 'erc20_transfer2') {

      console.log("transfering2");
      const res = await router.process('erc20_transfer', data);
      console.log('transfer2 res ', res)
      return 'accept'
  
    } else if (JSONpayload.method === 'erc20_transfer') {
      
      const bal = await wallet.balance_get(msg_sender.toLowerCase())
      console.log('balance ', bal.ether_get())

      let transferNotice = await wallet.erc20_transfer(
        JSONpayload.from.toLowerCase(),
        JSONpayload.to.toLowerCase(),
        JSONpayload.erc20.toLowerCase(),
        viem.parseEther((JSONpayload.amount).toString())
      );

      console.log('transfer notice ', transferNotice)

      await fetch(rollup_server + "/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: transferNotice.payload }),
      });

      return 'accept'


    } else if (JSONpayload.method === 'ether_withdraw') {

      
      console.log("ether_withdraw");
      return router.process(JSONpayload.method, data);
  
    } else if (JSONpayload.method === 'createGame') {
      if (JSONpayload.data == '' || null) {
        console.log('Result cannot be empty');
        await reportHandler(message)
        return 'reject'
      }
  
      console.log('creating game...');
      const res = await addGame(JSONpayload.data);
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
      advance_req = await noticeHandler(games);
  
  
    } else if (JSONpayload.method === 'addParticipant') {

      console.log('adding participant ...', JSONpayload.data);

      const bal = await wallet.balance_get(msg_sender.toLowerCase())
      console.log('balance ', bal.ether_get())

      let transferNotice = await wallet.ether_transfer(
        msg_sender.toLowerCase(),
        '0x0',
        viem.parseEther((JSONpayload.data.amount).toString())
      );

      console.log('transfer notice ', transferNotice)

      const res = await addParticipant(JSONpayload.data)
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

    return router.process(balance, address)

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
