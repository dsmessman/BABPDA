import { gql } from '@apollo/client'

export default gql`
subscription Categories($first: Int, $offset: Int, $categoryfilter: String!) {
    queryCategories(first: $first, offset: $offset, order: {desc: sortorder}, filter: {name: {anyoftext: $categoryfilter}, isactive: true}) {
        name
        sortorder
        isactive
        id
        announcements(first: 10, offset: 0) {
          projectname
          image
          id
          articleid
          createdat
          cost
          content
          contentpreview
          seller_wallet
          articletransactionsAggregate {
            amountpaidSum
          }
        }
    }
}`