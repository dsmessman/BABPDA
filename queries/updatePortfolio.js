import { gql } from '@apollo/client'

const UPDATE_PORTFOLIO = gql`
  mutation addWallet($wallet: [AddWalletInput!]!, $address: String!, $type: String!) {
    bulkDeleteWalletPortfolio(address: $address, type: $type) {
      msg
      numUids
    }
    addWallet(input: $wallet, upsert: true) {
      numUids
    }
  }
`;

export { UPDATE_PORTFOLIO };