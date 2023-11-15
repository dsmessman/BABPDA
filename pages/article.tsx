/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import Head from 'next/head'
import {
    Box,
    Button,
    Center,
    Container,
    Text,
    Flex,
    Image,
    HStack,
    Link,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Skeleton,
    Spacer,
    Spinner,
    Tooltip,
    Icon,
    useMediaQuery,
    useClipboard,
    useColorModeValue,
    useBreakpointValue,
    Textarea
  } from "@chakra-ui/react"
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import client from "../lib/apollo"
import GET_ARTICLE_BY_ID from "../queries/getArticleById"
import favicon from "../public/favicon.ico"
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { WEB3 } from '../lib/web3'
import { getCookie } from 'cookies-next'
import { showErrorToaster, showNetworkSuccessTx } from '../src/Toaster'
import { BiSolidFlag } from 'react-icons/bi'

export async function getServerSideProps(context) {

  if (!context.query.id || isNaN(context.query.id)) {
    return {
        notFound: true,
    };
  }

  let currentwallet = (context.req.cookies['cw'] !== undefined)? context.req.cookies['cw'] : ''
  let articleid = context.query.id? context.query.id : 1
 
  const { data } = await client.mutate({
    mutation: GET_ARTICLE_BY_ID,
    variables: { articleid: parseInt(articleid), address: currentwallet },
  });
  
  //404 a invalid article ID
  if (data?.queryAnnouncements.length === 0) {
    return {
        notFound: true,
    }
  }
  //@ts-ignore
  return {
        props: {
            article: data?.queryAnnouncements[0]
        }
   }
}
const Article = (props) => {
  const { article } = props;
  //console.log("article", article)
  const { defaultWallet, sessionWallet, currency, connected, updateWallet, loading, handleFetchAnnouncements } = useNavigation()
  const [isPurchasing, setIsPurchasing] = React.useState(false)
  const colorBoxBg = useColorModeValue('#dcdde1', 'gray.700')
  const buttonColor = useColorModeValue('red', 'red')
  const colorText = useColorModeValue('black', 'black')
  const padding = useBreakpointValue({ base: '5', md: '10'})
  const innerPadding = useBreakpointValue({ base: '3', md: '5'})
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const [sharelink, setSetShareLink] = React.useState("https://www.pressdotalgo.com/article?id="+article.articleid);
  const { onCopy, hasCopied } = useClipboard(sharelink);
  const [purchasedContent, setPurchasedContent] = React.useState<number>((article.articletransactionsByWallet !== null)? article.articletransactionsByWallet?.amountpaidSum : 0)
  
  
  const formatDate = (sourceDate: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
  }

  async function purchaseContent(event) {
    setIsPurchasing(true)
    event.stopPropagation()
    event.preventDefault()
    if(article.id) {
        await WEB3.buyArticle(sessionWallet, article.id, article.cost, article.seller_wallet, currency).then((txid: any) => {
            //console.log("verified", txid)
            if(txid && txid !== undefined) {
                var now = new Date().toISOString()
                var currentWalletNFD = (getCookie('cw_nfd'))? getCookie('cw_nfd') : null
                var encodedJsonObject = Buffer.from(JSON.stringify(txid)).toString('base64'); 
                fetch('/api/buyArticle', {
                    method: 'POST',
                    body: JSON.stringify({
                        txBlob: encodedJsonObject,
                        articleid: parseInt(article.articleid),
                        address: defaultWallet, 
                        seller_wallet: article.seller_wallet,
                        articletransactions: [{
                            amountpaid: article.cost, 
                            tokenunit: (currency.unitname)? currency.unitname : 'ALGO', 
                            receiver: defaultWallet, 
                            receiver_nfd: currentWalletNFD,
                            article_id: parseInt(article.articleid), 
                            createdat: now
                        }]
                    })
                }).then((res) => {
                    res.json().then((getStatus) => {
                        //console.log("Auction ", getStatus)x
                        if(getStatus.success) {
                            showNetworkSuccessTx(getStatus.txid, isLargerThan768)
                            setPurchasedContent(article.cost)
                            setIsPurchasing(false)
                        } else {
                            showErrorToaster("Error Purchasing - Trying again")
                            setIsPurchasing(false)
                        }
                    }).catch((err)=>{ 
                        console.log("error ", err)
                        setIsPurchasing(false)
                    })
                }) 
            } else {
                setIsPurchasing(false)
            }
        }).catch((err)=>{ 
            console.log("error purchasing", err)
            setIsPurchasing(false)
        })
    } else {
        setIsPurchasing(false)
    }
}
  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>press.algo - Article Details</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
           {!loading ? (
              <>
                <Center>
                    <Text fontSize='xl'>Loading...</Text>
                </Center>
              </>
            ) : (
              <>
              <Box p={padding}>
              <Flex direction={['column', 'row']} bg={colorBoxBg} borderRadius='lg'>
                <Box h={'100%'} p={innerPadding}>
                    <Container p={3} centerContent>
                        <Image alt='press.algo' src={'placeholder.png'} />
                    </Container>
                </Box>
                <Box flex='1' p={innerPadding}>
                  <HStack spacing='24px'>
                    <Box w='100%' h='55px'>
                        <HStack>
                            <Box p={0}>
                                <Text p={0} fontSize='10px' color={colorText}>Created By: {article.projectname} {formatDate(article.createdat)}</Text>
                            </Box>
                            <Spacer />
                            <Box>
                            <Button onClick={onCopy} size='sm'>
                                {hasCopied ? "Link Copied" : "Share"}
                            </Button>
                            </Box>
                            <Box>
                                <Tooltip hasArrow label={'Flag this post'} aria-label='Tooltip'>
                                    <Link href={'mailto:dugan@pressdotalgo.com'} isExternal pl={1} pt={1} pb={1} pr={0}><Icon as={BiSolidFlag} /></Link>
                                </Tooltip>
                            </Box>
                        </HStack>
                    </Box>
                  </HStack>
                {connected ? (
                    <>
                    {purchasedContent > 0 ? (
                        <Box>
                            <Text>{article.content}</Text>
                        </Box>
                    ) : (
                        <Box>
                            <Text pb={4}>{article.contentpreview}</Text>
                            <Button size='sm' isLoading={isPurchasing} loadingText='Purchasing' colorScheme={buttonColor} onClick={purchaseContent}>Buy</Button>
                        </Box>
                    ) }
                    <Box pt={2}>
                        <Accordion allowToggle>
                        <AccordionItem borderColor="transparent">
                            <h2>
                            <AccordionButton>
                                <Box as="span" flex='1' textAlign='left'>
                                Comments
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            </h2>
                            <AccordionPanel pb={2}>
                                <Textarea placeholder='Enter Your Comment'></Textarea>
                                <Box>
                                    <Text pt={2} fontSize={'9px'}>** Cost 1000 PDAT to Comment</Text>
                                    <Tooltip hasArrow label={'1000 PDAT to Comment'} aria-label='Tooltip'>
                                        <Button size='sm' variant='ghost' isDisabled={true}>Submit Comment</Button>
                                    </Tooltip>
                                </Box>
                            </AccordionPanel>
                        </AccordionItem>
                        </Accordion>
                    </Box>
                    </>
                ) : (
                    <>
                    <Box>{article.contentpreview}</Box>
                    <Box pt={2}>
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
                    </Box>
                    </>
                )}
                </Box>
              </Flex>
              </Box>
             </>
          )}
      </Box>
      <Footer />
    </>
  )
}

export default Article