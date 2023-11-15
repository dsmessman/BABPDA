import { gql } from '@apollo/client'

export default gql`
query Activity {
    aggregateArticleTransactions {
      amountpaidSum
    }
    aggregateAnnouncements {
      count
    }
    topsales: queryArticleTransactions(order: {desc: createdat}, first: 10, offset: 0) {
        amountpaid
        createdat
        article_id
        id
        receiver
        receiver_nfd
        tokenunit
        txid
        announcements {
          projectname
          image
          seller_wallet
          createdat
          cost
          mimetype
          seller_wallet_nfd
          categories {
            name
            projects {
              image
              name
            }
          }
        }
      }
}`