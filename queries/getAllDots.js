import { gql } from '@apollo/client'

export default gql`
query Announcements($first: Int, $offset: Int, $address: String, $from1hr: DateTime!, $from24hr: DateTime!) {
    hotdots: queryAnnouncements(filter: {and: {createdat: {ge: $from1hr}}}, first: $first, offset: $offset, order: {desc: createdat}) {
        projectname
        mimetype
        image
        cost
        content
        contentpreview
        id
        articleid
        createdat
        seller_wallet
        articletransactionsByWallet: articletransactionsAggregate(filter: {receiver: {eq: $address}}) {
          amountpaidSum
        }
        articleviews: articletransactionsAggregate {
          count
        }
    }
    topdots: queryAnnouncements(filter: {and: {createdat: {ge: $from24hr}}}, first: $first, offset: $offset, order: {desc: createdat}) {
        projectname
        mimetype
        image
        cost
        content
        contentpreview
        id
        articleid
        createdat
        seller_wallet
        articletransactionsByWallet: articletransactionsAggregate(filter: {receiver: {eq: $address}}) {
          amountpaidSum
        }
        articleviews: articletransactionsAggregate {
          count
        }
    }
    livedots: queryAnnouncements(first: $first, offset: $offset, order: {desc: createdat}) {
        projectname
        mimetype
        image
        cost
        content
        contentpreview
        id
        articleid
        createdat
        seller_wallet
        articletransactionsByWallet: articletransactionsAggregate(filter: {receiver: {eq: $address}}) {
          amountpaidSum
        }
        articleviews: articletransactionsAggregate {
          count
        }
    }
}`