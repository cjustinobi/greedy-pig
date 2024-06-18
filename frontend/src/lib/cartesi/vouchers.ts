import { createClient, Client, cacheExchange, fetchExchange } from 'urql';

export class VoucherService {
  private client: Client;

  constructor() {
    this.client = createClient({
      url: 'http://localhost:8080/graphql',
      exchanges: [fetchExchange]
    });
  }

  getClient(): Client {
    return this.client;
  } 
 
 getVouchers = async () => {
    const query = `
    {   
      vouchers {
        edges {
          node {
            index
            input{
              index
              payload
            }
            payload
            proof{
              context
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
    `;

    let result = await (this.client.query(query, {})).toPromise()

    if (!result || !result.data?.vouchers.edges){
      return []
    }
    return result.data.vouchers.edges
  }


  async getVoucherWithProof(voucherIndex: number, inputIndex: number) {
    const query = `
    query GetVoucher($voucherIndex: Int!,  $inputIndex: Int!) {   
      voucher( voucherIndex: $voucherIndex,  inputIndex: $inputIndex) {
        index
        input{
          index
          payload
        }
        destination
        payload
        proof{
          validity{
            inputIndexWithinEpoch
            outputIndexWithinInput
            outputHashesRootHash
            vouchersEpochRootHash
            noticesEpochRootHash
            machineStateHash
            outputHashInOutputHashesSiblings
            outputHashesInEpochSiblings
          }
          context
        }
      }
    }
    `;

    let result = await (this.client.query(query, {
      "voucherIndex": voucherIndex,
      "inputIndex": inputIndex
    })).toPromise()

    return result.data.voucher
  }

}