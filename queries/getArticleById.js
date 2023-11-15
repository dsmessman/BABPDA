import { gql } from '@apollo/client'

export default gql`
subscription Announcements($articleid: Int, $address: String) {
    queryAnnouncements(filter: {articleid: {eq: $articleid}}) {
        projectname
        mimetype
        image
        cost
        content
        contentpreview
        seller_wallet
        id
        createdat
        articleid
        articletransactionsByWallet: articletransactionsAggregate(filter: {receiver: {eq: $address}}) {
          amountpaidSum
        }
  }
}`