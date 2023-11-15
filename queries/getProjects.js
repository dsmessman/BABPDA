import { gql } from '@apollo/client'

export default gql`
subscription Projects($first: Int, $offset: Int) {
    queryProjects(first: $first, offset: $offset) {
        createdat
        discord
        id
        image
        isactive
        name
        marketplace
        reddit
        twitter
        website
    }
}`