import { gql } from '@apollo/client'

export default gql`
query Tokens {
    queryTokens(filter: {isactive: true}) {
        id
        name
        baseamount
        maxamount
        asset_id
        apy
        unitname
        decimal
        rate
        website
        frequency
        isactive
    }
    queryWhitelist {
      asset_id
      unitname
      collection_id
      reserve
    }
}`