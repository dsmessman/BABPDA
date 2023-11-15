/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import Head from 'next/head'
import {
    Box,
    Button,
    Grid,
    GridItem,
    Center,
    Container,
    Text,
    Stack,
    VStack,
    Flex,
    Heading,
    Spacer,
    HStack,
    Input,
    FormLabel,
    Skeleton,
    Spinner,
    useMediaQuery,
    useColorModeValue,
    useBreakpointValue
  } from "@chakra-ui/react"
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons'
import Router, { useRouter } from "next/router" 
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ReactPaginate from "react-paginate"
import { isOptedIntoAsset, sendWait, getSuggested } from '../lib/algorand'
import client from "../lib/apollo"
import { useNavigation } from "../src/contexts/navigation.context"
import GET_ARTICLE_PURCHASES_BY_WALLET from "../queries/getArticlePurchasesByWallet"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { ArticlePurchase } from '../src/ArticlePurchase'
import favicon from "../public/favicon.ico"

const PAGE_SIZE=4;
export async function getServerSideProps(context) {

  //const searchaddress = context.query.address? context.query.address : ''
  let page = context.query.page? parseInt(context.query.page) : 1
  let searchaddress = (context.req.cookies['cw'] !== undefined)? context.req.cookies['cw'] : ''
  let offset = (page===1)? 0 : PAGE_SIZE * (page -1)
  const { data } = await client.query({
    query: GET_ARTICLE_PURCHASES_BY_WALLET,
    variables: { first: PAGE_SIZE, offset: offset, address: searchaddress },
  });
  
  page = page == 0 ? 1 : page - 1;
  const pageTotal = (data?.aggregateArticleTransactions)? data?.aggregateArticleTransactions.count / PAGE_SIZE : 0;

  return {
    props: {
      //@ts-ignore
      myPurchases: (data.queryArticleTransactions)? data.queryArticleTransactions : [],
      curPage: page,
      maxPage: Math.ceil(pageTotal)
    }
  }
}
const MyPurchases = (props) => {

  const { myPurchases, curPage, maxPage } = props;
  //console.log("myPurchases", myPurchases)
  const router = useRouter()
  const tag = undefined
  const filters = new URLSearchParams('')//router.query
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const [loading, setLoading] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [tokenFilter, setTokenFilter] = React.useState()
  const [isOptingOut, setIsOptingOut] = React.useState(false)
  const [filtersChanged, setFiltersChanged] = React.useState(true)
  const [filteredOptOutAssets, setFilteredOptOutAssets] = React.useState([])
  const colorText = useColorModeValue('black', 'white')
  const { defaultWallet, sessionWallet, connected, handleFetchAnnouncements, currency, updateWallet } = useNavigation()

  React.useEffect(()=>{
      if(loaded) return 
      if(myPurchases || filtersChanged)
          setLoaded(true)
          setFiltersChanged(false)
          setLoading(true) 
      return ()=>{}
  }, [loaded, myPurchases, filtersChanged])

  function updateTokenFilter(val){ setTokenFilter(val.target.value.toUpperCase()) }

  // Only allow filtering by price if no tag is chosen
  function filterRaffles() { 
      router.push("/history/?asset="+router.query.asset+"&address="+router.query.address+"&token="+tokenFilter) 
      setLoaded(false)
      setFiltersChanged(true)
  } 
  
  async function handleOptOutAsset(optOutAssets){
}
  
  
  // Triggers fetch for new page
  const handlePagination = page => {
    const path = router.pathname
    const query = router.query
    query.page = page.selected + 1
    router.push({
      pathname: path,
      query: query,
    })
  }

  const priceFilter = tag===undefined?(
      <Container p={2} maxW='container.xl'>
          <Center>
              <HStack>
                  <FormLabel>Filter By Asset ID</FormLabel>
                  <Input size='s' defaultValue='' maxW={150} onChange={updateTokenFilter} />
                  <Button colorScheme='blue' onClick={filterRaffles}>Filter</Button>
              </HStack>
          </Center>
      </Container>
  ):<Container></Container>

  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>My Purchases History</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} size="xl">
              Connect your Wallet
            </Heading>
            <AlgorandWalletConnector 
                        darkMode={true}
                        //@ts-ignore
                        sessionWallet={sessionWallet}
                        connected={connected} 
                        //@ts-ignore
                        updateWallet={updateWallet}
                        //@ts-ignore
                        handleFetchAnnouncements={handleFetchAnnouncements}
                        />
          </VStack>
        </Center>
      </Container>
    </>
    );
  }

  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>My Purchases - press.algo</title>
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
                <Center>
                    <Heading size='xl'>My Article Purchases</Heading>
                </Center>
                <Box pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                    {myPurchases.length > 0 ? (
                        <Grid
                            templateRows="repeat(1, 1fr)"
                            templateColumns="repeat(1, 1fr)"
                            gap={4}
                            px={{ base: 0, md: 5}}
                            mt={{ base: 0, md: 5}}
                            w={'100%'}
                        > 
                            {myPurchases.map((purchase) => (
                              <GridItem w='100%' colSpan={colSpan} key={purchase.id}><ArticlePurchase nft={purchase} wallet={sessionWallet}/></GridItem>
                            ))}
                        </Grid>
                    ) : (
                        <Container p={2} centerContent>
                            <Text>No Articles Found</Text>
                        </Container>
                    )}
                </Box>
                <Container centerContent={true} p={3} h={{ base: 35}}>
                    <ReactPaginate
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        previousLabel={(maxPage === 0)? '' : <ArrowLeftIcon />}
                        nextLabel={(maxPage === 0)? '' : <ArrowRightIcon />}
                        breakLabel={"..."}
                        initialPage={curPage}
                        pageCount={maxPage}
                        onPageChange={handlePagination}
                        containerClassName={"paginate-wrap"}
                        pageClassName={"paginate-li"}
                        pageLinkClassName={"paginate-a"}
                        activeClassName={"paginate-active"}
                        nextLinkClassName={"paginate-next-a"}
                        previousLinkClassName={"paginate-prev-a"}
                        breakLinkClassName={"paginate-break-a"}
                    />
                </Container>
             </>
          )}
      </Box>
      <Footer />
    </>
  )
}

export default MyPurchases