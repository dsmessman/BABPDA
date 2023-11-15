import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  VStack,
  Center,
  Grid, 
  GridItem,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Spinner,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Text,
  Icon, 
  Flex,
  Tooltip, 
  Spacer, 
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper
} from '@chakra-ui/react'
import * as React from 'react'
import Navigation from '../components/Navigation'
import { useNavigation } from "../src/contexts/navigation.context"
import { StatisticsCard } from '../src/StatisticsCard'
import client from "../lib/apollo"
import GET_CREATOR_ACTIVITY from "../queries/getCreatorActivity"
import favicon from "../public/favicon.ico"

export async function getServerSideProps(context) {
  //console.log("CONTEXTQUERY", context.query)
  const { data } = await client.mutate({
    mutation: GET_CREATOR_ACTIVITY,
  });
  //console.log("data", data)
  return {
    props: {
      //@ts-ignore
      totalsales: (data.aggregateArticleTransactions)? data.aggregateArticleTransactions.amountpaidSum : 0,
      totalarticles: (data.aggregateAnnouncements)? data.aggregateAnnouncements.count : 0,
      topsales: (data.topsales)? data.topsales : [],
      recentsales: (data.recentsales)? data.recentsales : []
    }
  }
}

export default function Activity(props) {
  const { totalsales, topsales, recentsales, totalarticles } = props;
  //console.log("topsales",topsales)
  //console.log("recentsales",recentsales)
  const percentChangeTopSales = (topsales[0].amountpaid / (topsales[0].amountpaid - topsales[1].amountpaid)) * 100
  const { currency } = useNavigation()
  const colorText = useColorModeValue('black', 'white')
  const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
  const boxWidth = useBreakpointValue({ base: '100%', md: '40%'})

  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>press.algo - activity</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
            <Center mt='3'>
                <Heading size='xl'>Creator Stats</Heading>
            </Center>
             <Box w={boxWidth} mt='3' mb='3'>
             <StatGroup>
                <Stat p={{ base: '1', md: '2'}}>
                    <StatLabel>Top Sale</StatLabel>
                    <StatNumber fontFamily={"Atkinson Hyperlegible"}>{(topsales[0].amountpaid / currency.rate).toFixed(2)} {currency.unitname}</StatNumber>
                    <StatHelpText>
                    {percentChangeTopSales > 0 ? ( <StatArrow type='increase' /> ) : null }
                    {percentChangeTopSales.toFixed(2)} %
                    </StatHelpText>
                </Stat>
                <Stat p={{ base: '1', md: '2'}}>
                    <StatLabel>Total Articles</StatLabel>
                    <StatNumber fontFamily={"Atkinson Hyperlegible"}>{totalarticles}</StatNumber>
                </Stat>
                <Stat p={{ base: '1', md: '2'}}>
                    <StatLabel>Total Sales</StatLabel>
                    <StatNumber fontFamily={"Atkinson Hyperlegible"}>{(totalsales / currency.rate).toFixed(2)} {currency.unitname}</StatNumber>
                </Stat>
             </StatGroup>
            </Box>
            <Box mt='3' mb='3'>
             <Heading size='xl'>Top 10 Recent Sales</Heading>
            {topsales.length > 0 ? (
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns="repeat(1, 1fr)"
                    gap={2}
                    px={{ base: 0, md: 4}}
                    mt={{ base: 0, md: 4}}
                    w={'100%'}
                > 
                <GridItem w='100%'>
                    <Box maxWidth={{ base: '400px', md: '800px'}} margin={0} borderWidth='2px' borderRadius='lg'>
                        <Flex width='100%' alignItems='center' gap={{ base: '1', md: '4'}}>
                            <Box pl={{ base: '0', md: '2'}} pr={{ base: '0', md: '2'}} minWidth={{ base: '56px', md: '66px'}}><Text fontSize={'xs'}></Text></Box>
                            <Box pl={{ base: '1', md: '2'}} minWidth={{ base: '80px', md: '180px'}}>
                                <Text fontSize={'xs'}>Date Purchased</Text>
                            </Box>
                            <Box minWidth={{ base: '60px', md: '180px'}}>
                                <Text fontSize={'xs'}>Creator</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '80px'}}>
                                <Text fontSize={'xs'}>Sold</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '180px'}} pl={2} pr={2}>
                                <Text fontSize={'xs'}>Buyer</Text>
                            </Box>
                        </Flex>
                    </Box> 
                </GridItem>
                    {topsales.map((sale) => (
                        <GridItem w='100%' key={sale.id}><StatisticsCard sale={sale} currency={currency} /></GridItem>
                    ))}
                </Grid> 
            ) : (
                <Container p={2} centerContent>
                    <Text>No Articles Found</Text>
                </Container>
            )}
            </Box>
      </Container>
    </>
  )
}
