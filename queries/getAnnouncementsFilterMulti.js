import { gql } from '@apollo/client'

export default gql`
subscription Categories($first: Int, $offset: Int, $categoryfilter: String!, $projectfilter: String!) {
    queryCategories(first: $first, offset: $offset, filter: {name: {anyoftext: $categoryfilter}, isactive: true}, order: {desc: sortorder}) {
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