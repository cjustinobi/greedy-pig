import { useQuery } from '@apollo/client'
import { ethers } from 'ethers'
import { useState } from 'react'
import { gql } from 'urql'

export type TNotice = {
  id: string
  index: number
  input: any //{index: number; epoch: {index: number; }
  payload: string
}

// GraphQL query to retrieve notices given a cursor
export const GET_NOTICES = gql`
  query GetNotices($cursor: String) {
    notices(last: 1, after: $cursor) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          index
          input {
            index
          }
          payload
        }
      }
    }
  }
`

export const useNotices = () => {
  const [cursor] = useState(null)
  // debugger
  const { loading, error, data, refetch } = useQuery(GET_NOTICES, {
    variables: { cursor },
    pollInterval: 1000,
  })

  const notices: TNotice[] = data?.notices.edges
    .map((node: any) => {
      const n = node.node
      let inputPayload = n?.input.payload
      if (inputPayload) {
        try {
          inputPayload = ethers.utils.toUtf8String(inputPayload)
        } catch (e) {
          inputPayload = inputPayload + ' (hex)'
        }
      } else {
        inputPayload = '(empty)'
      }
      let payload = n?.payload
      if (payload) {
        try {
          payload = ethers.utils.toUtf8String(payload)
        } catch (e) {
          payload = payload + ' (hex)'
        }
      } else {
        payload = '(empty)'
      }
      return {
        id: `${n?.id}`,
        index: parseInt(n?.index),
        payload: `${payload}`,
        input: n ? { index: n.input.index, payload: inputPayload } : {},
      }
    })
    .sort((b: any, a: any) => {
      if (a.input.index === b.input.index) {
        return b.index - a.index
      } else {
        return b.input.index - a.input.index
      }
    })

  return { loading, error, data, notices, refetch }
}
