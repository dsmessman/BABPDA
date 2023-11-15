import { gql } from '@apollo/client'

const INSERT_UPDATE_ARTICLE = gql`
  mutation addAnnouncements($articles: [AddAnnouncementsInput!]!) {
    addAnnouncements(input: $articles, upsert: true) {
      numUids
    }
  }
`;

export { INSERT_UPDATE_ARTICLE };