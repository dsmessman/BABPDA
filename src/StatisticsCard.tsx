/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Icon, Tooltip, Text, Link, Image, Flex, useColorModeValue } from '@chakra-ui/react'
import { WEB3 } from '../lib/web3'
import NextLink from 'next/link'

type StatisticsCardProps = {
    sale: any;
    currency: any;
};

export function StatisticsCard(props: StatisticsCardProps) {
   //console.log("StatisticsCard",props)
  const { sale, currency } = props;
    
    const formatDate = (sourceDate: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
    }

    return (
        <Box maxWidth={{ base: '400px', md: '800px'}}  bg={useColorModeValue('#dcdde1', '#3f4550')} margin={0} borderWidth='2px' borderRadius='lg'>
            <Flex width='100%' alignItems='center' gap={{ base: '1', md: '4'}}>
                <Box pl={{ base: '0', md: '2'}} pr={{ base: '0', md: '2'}} minWidth={{ base: '56px', md: '66px'}}>
                <NextLink href={'/article/?id='+sale.article_id} passHref>
                    <a>
                    <Image boxSize='50px' objectFit='cover' borderRadius='lg' alt='press.algo' src={sale.announcements.categories[0]?.projects.find((project) => project.name === sale.announcements.projectname)?.image || 'placeholder.png'} />
                    </a>
                </NextLink>
                </Box>
                <Box pl={{ base: '1', md: '2'}} minWidth={{ base: '80px', md: '180px'}}>
                    <Text fontSize={'xs'}> {formatDate(sale.createdat)}</Text>
                </Box>
                <Box minWidth={{ base: '60px', md: '180px'}}>
                    <Link href={'https://www.asastats.com/'+sale.announcements.seller_wallet} isExternal>
                    <Text fontSize={'xs'}>{sale.announcements.projectname}</Text>
                    </Link>
                </Box>
                <Box minWidth={{ base: '50px', md: '80px'}}>
                    <Link href={'https://algoexplorer.io/tx/'+sale.txid} isExternal>
                    <Text fontSize={'xs'}>{(sale.amountpaid / currency.rate).toFixed(2)} {currency.unitname}</Text>
                    </Link>
                </Box>
                <Box minWidth={{ base: '50px', md: '180px'}} pl={2} pr={2}>
                    <Link href={'https://www.asastats.com/'+sale.receiver} isExternal>
                    <Text fontSize='xs'>{(sale.receiver_nfd !== null) ? sale.receiver_nfd :  sale.receiver.substring(0, 5) + '...' + sale.receiver.slice(-4)}</Text>
                    </Link>
                </Box>
            </Flex>
        </Box> 
    )
}