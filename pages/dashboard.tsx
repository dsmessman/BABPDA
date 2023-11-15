import Head from 'next/head'
import {
  Box,
  Heading,
  Spacer,
  Flex,
  Container, 
  HStack,
  Button,
  Link,
  VStack,
  Image,
  Progress,
  Center,
  Grid, 
  GridItem,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Input,
  FormLabel,
  Spinner,
  Text
} from '@chakra-ui/react'
import * as React from 'react'
import NextLink from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { CategoryCard } from '../src/CategoryCard'
import { CategoryPopup } from '../src/CategoryPopup'
import { ProjectPopup } from '../src/ProjectPopup'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import InfiniteScroll from 'react-infinite-scroll-component'

export default function DashboardPage(props) {
  //console.log("DashboardPage",props)
  const tag = undefined
  const colSpan = useBreakpointValue({ base: 4, md: 1})
  const bgColorMode = useColorModeValue('gray.700', 'gray.700')
  const [ isLargerThan2560 ] = useMediaQuery("(min-width: 2560px)")
  const { defaultWallet, sessionWallet, connected, loading, announcements, pageFilter, setPageFilter, categoryFilter, setCategoryFilter, hasNextPage, fetchNextPage, handleFetchAnnouncements } = useNavigation()
  const colorText = useColorModeValue('white', 'white')
  //console.log("announcements", announcements)
  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>press.algo - My Dashboard</title>
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
              <Flex ml={{ base: 0, md: 6}} mr={{ base: 0, md: 6}} direction={'row'}>
                  <CategoryPopup defaultWallet={defaultWallet} wallet={sessionWallet} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} />
                  <ProjectPopup defaultWallet={defaultWallet} wallet={sessionWallet} pageFilter={pageFilter} setPageFilter={setPageFilter} />
                  <Spacer />
                  <Center>
                    <Box as='button' color={'black'} bg={bgColorMode} borderWidth='1px' borderRadius='lg' m={4} p={3}>
                          <NextLink href={'/create'} passHref><Text fontSize='xs' color='white'>Create Article</Text></NextLink>
                    </Box>
                  </Center>
              </Flex>
              <Box pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                  <InfiniteScroll
                    dataLength={announcements.length}
                    next={fetchNextPage}
                    hasMore={(announcements.length >= 4)? hasNextPage: false}
                    loader={(isLargerThan2560 && announcements.length === 3)? (<Center><Text>Looks like your on a larger screen. Pull down to load more</Text></Center>) : (<Center><Box w='40%' p={2}><Progress size='sm' isIndeterminate /></Box></Center>) }
                    // below props only if you need pull down functionality
                    refreshFunction={fetchNextPage}
                    pullDownToRefresh={(isLargerThan2560 && announcements.length === 3)? true: false}
                    pullDownToRefreshThreshold={50}
                    pullDownToRefreshContent={
                      <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                    }
                    releaseToRefreshContent={
                      <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                    }
                  >
                      {announcements.length > 0 ? (
                        <Grid
                          templateRows="repeat(1, 1fr)"
                          templateColumns="repeat(3, 1fr)"
                          gap={4}
                          px={{ base: 0, md: 4}}
                          mt={{ base: 0, md: 4}}
                      > 
                          {announcements.map((category) => (
                              <GridItem colSpan={colSpan} key={category.id}>
                                    <CategoryCard key={category.id} 
                                                announcement={category}  
                                                defaultWallet={defaultWallet}
                                                wallet={sessionWallet} 
                                                connected={connected}
                                                handleFetchAnnouncements={handleFetchAnnouncements} />
                              </GridItem>
                          ))}
                      </Grid>
                    ) : (
                      <Container p={2} centerContent>
                          <Text>No Articles Found</Text>
                      </Container>
                    )} 
                  </InfiniteScroll>
              </Box>
              </>
            )}
      </Box>
      <Footer />
    </>
  )
}
