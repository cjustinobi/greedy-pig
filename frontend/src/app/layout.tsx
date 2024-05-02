'use client'

import { Provider } from 'react-redux'
import { Inter } from 'next/font/google'
import { init } from '@web3-onboard/react'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import injectedModule from '@web3-onboard/injected-wallets'
import { Toaster } from 'react-hot-toast'

import configFile from '@/config/cartesi.json'
import store from '@/store'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const config: any = configFile

const injected: any = injectedModule()
init({
  wallets: [injected],
  chains: Object.entries(config).map(([k, v]: [string, any], i) => ({
    id: k,
    token: v.token,
    label: v.label,
    rpcUrl: v.rpcUrl,
  })),
  appMetadata: {
    name: 'Greedy Pig',
    icon: '<svg><svg/>',
    description: 'Greedy Pig On Cartesi',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
})

//Setup GraphQL Apollo client
// const serverUrl = process.env.NODE_ENV === 'development'
//   ? 'http://localhost:8080'
//   : process.env.NEXT_PUBLIC_SERVER_URL
const serverUrl = 'https://greedypig.fly.dev'
// const serverUrl = 'http://localhost:8080'
const URL_QUERY_GRAPHQL = `${serverUrl}/graphql`

const client = new ApolloClient({
  uri: URL_QUERY_GRAPHQL,
  cache: new InMemoryCache(),
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Provider store={store}>
          <ApolloProvider client={client}>
            {children}
            <Toaster />
          </ApolloProvider>
        </Provider>
      </body>
    </html>
  )
}
