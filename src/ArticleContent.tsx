
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, 
    Avatar, 
    Container, 
    Text, 
    Fade, 
    Link, 
    Image, 
    Button, 
    Table, 
    Thead, 
    Tbody, 
    VStack,
    HStack, 
    Center, 
    Stack,
    Modal, 
    ModalOverlay, 
    ModalBody, 
    ModalContent, 
    ModalHeader,
    ModalFooter,
    ModalCloseButton,
    Spacer,
    Popover,
    PopoverContent,
    PopoverCloseButton,
    PopoverHeader,
    PopoverTrigger,
    PopoverArrow,
    PopoverBody,
    Flex,
    Th, 
    Tr, 
    Td, 
    Tooltip, 
    useDisclosure,
    useMediaQuery,
    useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet/dist'
import { getCookie } from 'cookies-next'
import { WEB3 } from '../lib/web3'
import { showErrorToaster, showNetworkSuccessTx } from '../src/Toaster'
import { useRouter } from 'next/router'

type ArticleContentProps = {
    article: any;
    wallet: Wallet;
    defaultWallet: any;
    currency: any;
    connected: any;
};

export function ArticleContent(props: ArticleContentProps) {
    //console.log("ArticleContent",props)
    const router = useRouter()
    const { defaultWallet, article, connected, currency } = props;
    const colorText = useColorModeValue('white', 'white')
    const [isPurchasing, setIsPurchasing] = React.useState(false)
    const buttonColor = useColorModeValue('red', 'red')
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
    const [purchasedContent, setPurchasedContent] = React.useState<number>((article.articletransactionsByWallet !== null)? article.articletransactionsByWallet?.amountpaidSum : 0)
    
    const formatDate = (sourceDate: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: "long", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
    }

    function redirectPage() { 
      router.push("/article?id=" + article.articleid);
    }
    
    async function purchaseContent(event) {
        setIsPurchasing(true)
        event.stopPropagation()
        event.preventDefault()
        if(article.id) {
            await WEB3.buyArticle(props.wallet, article.id, article.cost, article.seller_wallet, currency).then((txid: any) => {
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
                                redirectPage()
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
        <Box bg={useColorModeValue('gray.500', 'gray.500')} margin={1} borderWidth='1px' borderRadius='lg'>
            <Stack direction={{ sm: 'row',  md: 'column', lg: 'column', xl: 'column'}}>
                <Box p={{ base: 0, md: 1}} maxWidth={{ base: '100%', md: '100%'}}>
                <Flex>
                    <Box> 
                    <Container pl={2} pt={1}>
                        <Text fontSize='11px' color={colorText} noOfLines={1}>
                            <Link href={'article?id='+article.articleid}>{article.projectname}</Link>
                        </Text>
                    </Container>
                    <Container pl={2}>
                        <Text p={0} fontSize='9px' color={colorText}>{formatDate(article.createdat)}</Text>
                    </Container>
                    </Box>
                    <Spacer />
                    <Box> 
                        <Text fontSize='xs' align='right' color={colorText}>Views</Text>
                        <Text fontSize='xs' fontWeight='bold' color={colorText}>
                            {article.articleviews?.count}
                        </Text>
                    </Box>
                </Flex>
                    <Container p={2}>
                        <Popover trigger='hover' variant="rounded">
                        <PopoverTrigger>
                        <Text pt={2} pb={3} fontSize='xs' color={colorText} noOfLines={4}>
                            {article.contentpreview}
                        </Text>
                        </PopoverTrigger>
                        <PopoverContent bgColor='gray.800' width={{ base: '275px', md: '400px'}}>
                            <PopoverHeader color={'white'} fontWeight='semibold'>{article.projectname}<Text p={0} fontSize='9px' color={colorText}>{formatDate(article.createdat)}</Text></PopoverHeader>
                            <PopoverArrow />
                            <PopoverCloseButton color={'white'} />
                            <PopoverBody fontSize='xs' color={'white'}>
                                {article.contentpreview}
                            </PopoverBody>
                        </PopoverContent>
                        </Popover>
                        <Text fontSize='xs' color={colorText} noOfLines={1}>
                        {connected ? (
                            <VStack>
                                {purchasedContent > 0 ? (
                                    <Box>
                                        <Center mt={2}>
                                           <Text fontSize='xs' color={colorText}><Link href={'article?id='+article.articleid}>View Full Article</Link></Text>
                                        </Center>
                                    </Box>
                                ) : (
                                    <Box>
                                        <HStack>
                                            <Text>{(article.cost / currency.rate).toFixed(2)} {currency.unitname}</Text>
                                            <Button size='sm' isLoading={isPurchasing} loadingText='Purchasing' colorScheme={buttonColor} onClick={purchaseContent}>Buy</Button>
                                        </HStack>
                                    </Box>
                                ) }
                            </VStack>
                        ) : null }
                        </Text>
                    </Container>
                </Box>
            </Stack>
        </Box> 
    )

}