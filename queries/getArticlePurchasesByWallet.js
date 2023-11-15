import { gql } from '@apollo/client'

export default gql`
query articleTransactions($address: String, $first: Int, $offset: Int) {
    queryArticleTransactions(first: $first, offset: $offset, order: {desc: createdat}, filter: {receiver: {eq: $address}}) {
        txid
        tokenunit
        receiver_nfd
        receiver
        id
        createdat
        article_id
        amountpaid
      }
    aggregateArticleTransactions(filter: {receiver: {eq: $address}}) {
        count
    }
}`