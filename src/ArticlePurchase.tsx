
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Center, Tooltip, Icon, Text, Link, Image, HStack, Button, Table, Thead, Tbody, Tfoot, Th, Tr, Td, TableContainer, TableCaption, useColorModeValue, useMediaQuery } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet'

type ArticlePurchaseProps = {
    nft: any;
    wallet: Wallet;
};

export function ArticlePurchase(props: ArticlePurchaseProps) {
    //console.log("ArticlePurchase",props)
    const { nft, wallet } = props;
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
    const formatDate = (sourceDate: Date) => {
      const options: Intl.DateTimeFormatOptions = { month: "short", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
      return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
    }
    return (
        <>
        <Box bg={useColorModeValue('gray.400', 'gray.900')} margin={1} borderWidth='1px' borderRadius='lg'>
        <TableContainer>
            <Table variant='striped' colorScheme='red' size='sm' overflowX='scroll'>
                <Thead>
                    <Tr>
                        <Th></Th>
                        <Th>Date</Th>
                        <Th>Purchase</Th>
                        <Th>Transaction</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td><Link href={'article?id='+nft.article_id}><Text fontSize='xs'>View Article</Text></Link></Td>
                        <Td><Text fontSize='xs'>{formatDate(nft.createdat)}</Text></Td>
                        <Td>{(isLargerThan768) ?  nft.receiver : nft.receiver.substring(0, 5) + '...' + nft.receiver.slice(-4)}</Td>
                        <Td>
                            <Link href={'https://algoexplorer.io/tx/'+nft.txid} isExternal>
                                <Text>{(isLargerThan768) ?  nft.txid : nft.txid.substring(0, 5) + '...' + nft.txid.slice(-4)}</Text>
                            </Link>
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>
        </Box> 
        </>
    )

}