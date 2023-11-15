import { gql } from '@apollo/client'

export default gql`
subscription Projects($first: Int, $offset: Int, $creator: String) {
    queryProjects(filter: {creator: {eq: $creator}}, first: $first, offset: $offset) {
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