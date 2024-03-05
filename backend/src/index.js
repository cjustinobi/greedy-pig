
const viem = require('viem')
import { Router } from 'cartesi-router'
import { Wallet, Notice, Output, Error_out } from 'cartesi-wallet'
const { 
  noticeHandler,
  reportHandler
 } = require('./utils/helpers')
const { 
  games, 
  addParticipant, 
  addGame, 
  gamePlayHandler
} = require('./games')

const wallet = new Wallet(new Map())
const router = new Router(wallet)

const etherPortalAddress = '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044'
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
          return router.process("ether_deposit", payload);
        } catch (e) {
          return new Error_out(`failed to process ether deposti ${payload} ${e}`);
        }
      } else {

        let JSONpayload = {};

        const payloadStr = viem.hexToString(payload);
        JSONpayload = JSON.parse(JSON.parse(payloadStr));
        console.log(`received request ${JSON.stringify(JSONpayload)}`);
        let advance_req;

  try {

    if (JSONpayload.method === 'createGame') {
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
      const res = gamePlayHandler(JSONpayload.data)
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
  return 'accept';
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
      finish['status'] = await handler(rollup_req['data']);
    }
  }
})();
