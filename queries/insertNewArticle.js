import { gql } from '@apollo/client'

const INSERT_NEW_ARTICLE = gql`
  mutation addWalletArticle($name: String!, 
                            $projectname: String!, 
                            $content: String!,
                            $contentpreview: String!,
                            $image: String, 
                            $mimetype: String,
                            $cost: Float!, 
                            $createdat: DateTime!, 
                            $seller_wallet: String!) {
    newArticle(name: $name, 
              projectname: $projectname, 
              content: $content,
              contentpreview: $contentpreview,
              image: $image, 
              mimetype: $mimetype,
              cost: $cost, 
              createdat: $createdat, 
              seller_wallet: $seller_wallet) {
      name
    }
  }
`;

export { INSERT_NEW_ARTICLE };

/* const INSERT_NEW_ARTICLE = gql`
  mutation addCategories($article: [AddCategoriesInput!]!) {
    addCategories(input: $article, upsert: true) {
      numUids
      categories {
        isactive
      }
    }
  }
`;

export { INSERT_NEW_ARTICLE }; */