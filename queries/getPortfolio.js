import { gql } from '@apollo/client'

export default gql`
subscription queryWallet($address: String) {
    queryWallet(filter: {address: {eq: $address}}) {
        address
        selectedProjects {
            name
            type
            id
        }
    }
}`