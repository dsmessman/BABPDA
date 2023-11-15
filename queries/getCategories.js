import { gql } from '@apollo/client'

export default gql`
subscription Categories($first: Int, $offset: Int) {
    queryCategories(filter: {isactive: true}, first: $first, offset: $offset) {
        createdat
        id
        image
        isactive
        name
        sortorder
    }
}`