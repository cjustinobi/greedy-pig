
const { hexToString } = require('viem')
const { Router } = require('cartesi-router')
const { Wallet, Error_out, Notice, Report, Output } = require('cartesi-wallet')

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

let rollup_address = "";
let advance_req;


var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};
var finish = { status: "accept" };

const send_request = async (output) => {
  if (output instanceof Output) {
    let endpoint;
    console.log("type of output", output.type);

    if (output.type == "notice") {
      endpoint = "/report";
    } else if (output.type == "voucher") {
      endpoint = "/voucher";
    } else {
      endpoint = "/report";
    }

    console.log(`sending request ${typeof output}`);
    const response = await fetch(rollup_server + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(output),
    });
    console.debug(
      `received ${output.payload} status ${response.status} body ${response.body}`
    );
  }
};

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  try {
    const payload = data.payload;
    const msg_sender= data.metadata.msg_sender;
    console.log("msg sender is", msg_sender.toLowerCase());
    const payloadStr = hexToString(payload);

    if (msg_sender.toLowerCase() === etherPortalAddress.toLowerCase()) {
      try {
        return router.process("ether_deposit", payload);
      } catch (e) {
        return new Error_out(`failed to process ether deposti ${payload} ${e}`);
      }
    }
    if (msg_sender.toLowerCase() === dappAddressRelay.toLowerCase()) {
      rollup_address = payload;
      router.set_rollup_address(rollup_address, "ether_withdraw");
      router.set_rollup_address(rollup_address, "erc20_withdraw");
      router.set_rollup_address(rollup_address, "erc721_withdraw");

      console.log("Setting DApp address");
      return new Notice(
        `DApp address set up successfully to ${rollup_address}`
      );
    }

    if (msg_sender.toLowerCase() === erc20PortalAddress.toLowerCase()) {
      try {
        return router.process("erc20_deposit", payload);
      } catch (e) {
        return new Error_out(`failed ot process ERC20Deposit ${payload} ${e}`);
      }
    }

    
    const JSONPayload = JSON.parse(payloadStr);
    console.log("payload is ", JSONPayload);

    if (JSONPayload.method === 'createGame') {
      if (JSONPayload.data == '' || null) {
        console.log('Result cannot be empty');
        await reportHandler(message)
        return 'reject'
      }
  
      console.log('creating game...');
      const res = await addGame(JSONPayload.data);
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
      advance_req = await noticeHandler(games);
      return 'accept'
  
    } else if (JSONPayload.method === 'addParticipant') {

      console.log('adding participant ...', JSONPayload.data);

      const res = await addParticipant(JSONPayload.data)
      if (res.error) {
        await reportHandler(res.message);
        return 'reject';
      }
      advance_req = await noticeHandler(games)
      return 'accept'

    } else {

      try {
        return router.process(JSONPayload.method, data);
      } catch (e) {
        return new Error_out(`failed to process command ${payloadStr} ${e}`);
      }
    }

    
  } catch (e) {
    console.error(e);
    return new Error_out(`failed to process advance_request ${e}`);
  }
}

console.log('Game status ', JSON.stringify(games))

async function handle_inspect(data) {
  console.debug(`received inspect request data${data}`);
  try {
    const url = hexToString(data.payload).split("/");
    console.log("url is ", url);
    return router.process(url[0], url[1]);
  } catch (e) {
    const error_msg = `failed to process inspect request ${e}`;
    console.debug(error_msg);
    return new Error_out(error_msg);
  }
}


(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();

      var typeq = rollup_req.request_type;
      var handler;
      if (typeq === "inspect_state") {
        handler = handlers.inspect_state;
      } else {
        handler = handlers.advance_state;
      }
      var output = await handler(rollup_req.data);
      finish.status = "accept";
      if (output instanceof Error_out) {
        finish.status = "reject";
      }
  
      await send_request(output);
    }
  }
})();