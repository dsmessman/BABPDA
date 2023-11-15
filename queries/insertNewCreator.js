import { gql } from '@apollo/client'

const INSERT_NEW_CREATOR = gql`
  mutation addProjects($creator: [AddProjectsInput!]!) {
    addProjects(input: $creator) {
      numUids
      projects {
        isactive
      }
    }
  }
`;

export { INSERT_NEW_CREATOR };