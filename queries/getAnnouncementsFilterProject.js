import { gql } from '@apollo/client'

export default gql`
subscription Categories($first: Int, $offset: Int, $projectfilter: String!) {
    queryCategories(first: $first, offset: $offset, order: {desc: sortorder}, filter: {isactive: true}) {
        name
        sortorder
        isactive
        id
        announcements(first: 10, offset: 0, filter: {projectname: {anyoftext: $projectfilter}}) {
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