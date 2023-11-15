
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, 
    Container, 
    Text, 
    Grid,
    GridItem,
    Tooltip, 
    useDisclosure,
    useBreakpointValue,
    useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet/dist'
import { ArticleContent } from './ArticleContent'

type ArticleCardProps = {
    articles: any;
    type: any;
    defaultWallet: any;
    wallet: Wallet;
    currency: any;
    connected: any;
};

export function ArticleCard(props: ArticleCardProps) {
    //console.log("ArticleCard",props)
    const { defaultWallet, articles, type, wallet, currency, connected } = props;
    const colSpan = useBreakpointValue({ base: 4, md: 2})
    const colorBlackText = useColorModeValue('black', 'black')
    const colorWhiteText = useColorModeValue('white', 'white')
    
    return (
    <Box minHeight="80vh" bg={useColorModeValue('gray.200', 'gray.200')} margin={1} borderWidth='1px' borderRadius='lg'>
        <Container p={1} centerContent>
            <Tooltip hasArrow label={(type === 'Live Dots')? 'All Articles' : (type === 'Hot Dots')? 'Articles from the Last Hour' : 'Articles from the Last 24 Hours'} aria-label='Tooltip'>
                <Text fontSize='xs' color={colorBlackText} noOfLines={1}>
                {type}
                </Text>
            </Tooltip>
        </Container>
        <Container p={1} centerContent bg={useColorModeValue('gray.700', 'gray.700')} borderBottomLeftRadius='lg' borderBottomRightRadius='lg'>
            {articles.length > 0 ? (
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)"}}
                    gap={1}
                    px={{ base: 0, md: 1}}
                    mt={{ base: 0, md: 1}}
                > 
                    {articles.map((article) => (
                        <GridItem colSpan={colSpan} key={article.id}>
                            <ArticleContent key={article.id} 
                                        article={article}  
                                        defaultWallet={defaultWallet}
                                        wallet={wallet} 
                                        currency={currency} 
                                        connected={connected} />
                        </GridItem>
                    ))}
                </Grid>
            ) : (
                <Container p={2} centerContent>
                    <Text color={colorWhiteText}>No {type} Articles</Text>
                </Container>
            )} 
        </Container>
    </Box> 
    )

}