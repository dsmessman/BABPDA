import Head from 'next/head'
import {
  Box,
  VStack,
  Center,
  Grid, 
  GridItem,
  useColorModeValue,
  useBreakpointValue,
  Spinner,
  Text
} from '@chakra-ui/react'
import * as React from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { ArticleCard } from '../src/ArticleCard'
import { ProjectPopup } from '../src/ProjectPopup'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import client from "../lib/apollo"
import GET_ALL_DOTS from "../queries/getAllDots"

export async function getServerSideProps(context) {

  let currentwallet = (context.req.cookies['cw'] !== undefined)? context.req.cookies['cw'] : ''
  let articleCreatedAt1hrs = new Date()
  let articleCreatedAt24hrs = new Date()
  articleCreatedAt1hrs.setHours(articleCreatedAt1hrs.getHours() - 24)
  articleCreatedAt24hrs.setHours(articleCreatedAt24hrs.getHours() - 168)

  const { data } = await client.query({
    query: GET_ALL_DOTS,
    variables: { first: 16, offset: 0, address: currentwallet, from1hr: articleCreatedAt1hrs, from24hr: articleCreatedAt24hrs },
  });


  //@ts-ignore
  return {
        props: {
            hotdots: data?.hotdots,
            topdots: data?.topdots,
            livedots: data?.livedots
        }
   }
}

export default function HomePage(props) {
  //console.log("HomePage",props)
  const { hotdots, topdots, livedots } = props;
  const colSpan = useBreakpointValue({ base: 4, md: 1})
  const { defaultWallet, sessionWallet, currency, connected, loading} = useNavigation()
  const colorText = useColorModeValue('white', 'white')
  
  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>press.algo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        {!loading ? (
            <>
            <Box mt='2'>
              <Center>
                <VStack><Text fontSize='xl'>Loading...</Text><Spinner size='xl'/></VStack>
              </Center>
            </Box>
            </>
          ) : (
            <>
            {/* <Flex ml={{ base: 0, md: 6}} mr={{ base: 0, md: 6}} direction={'row'}>
                <ProjectPopup defaultWallet={defaultWallet} wallet={sessionWallet} pageFilter={pageFilter} setPageFilter={setPageFilter} />
                <Spacer />
            </Flex> */}
            <Box pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns="repeat(3, 1fr)"
                    gap={4}
                    px={{ base: 0, md: 4}}
                    mt={{ base: 0, md: 4}}
                > 
                    <GridItem colSpan={colSpan}>
                          <ArticleCard
                                      articles={topdots}  
                                      type={"Top Posts from the last week"}
                                      defaultWallet={defaultWallet}
                                      wallet={sessionWallet} 
                                      currency={currency}
                                      connected={connected} />
                    </GridItem>
                    <GridItem colSpan={colSpan}>
                          <ArticleCard
                                      articles={hotdots}  
                                      type={"Top Posts from the last day"}
                                      defaultWallet={defaultWallet}
                                      wallet={sessionWallet} 
                                      currency={currency}
                                      connected={connected} />
                    </GridItem>
                    <GridItem colSpan={colSpan}>
                          <ArticleCard
                                      articles={livedots}  
                                      type={"Live Dots"}
                                      defaultWallet={defaultWallet}
                                      wallet={sessionWallet} 
                                      currency={currency}
                                      connected={connected} />
                    </GridItem>
                </Grid>
            </Box>
            </>
          )}
      </Box>
      <Footer />
    </>
  )
}
