
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, 
    Avatar, 
    Container, 
    Text, 
    Grid,
    GridItem,
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
    Th, 
    Tr, 
    Td, 
    Tooltip, 
    useDisclosure,
    useBreakpointValue,
    useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet/dist';
import { useState, useEffect } from "react"
import { AnnouncementCard } from '../src/AnnouncementCard'

type CategoryCardProps = {
    announcement: any;
    defaultWallet: any;
    wallet: Wallet;
    connected: any;
    handleFetchAnnouncements: any;
};

export function CategoryCard(props: CategoryCardProps) {
    //console.log("CategoryCard",props)
    const { defaultWallet, announcement, wallet, handleFetchAnnouncements, connected } = props;
    const colSpan = useBreakpointValue({ base: 4, md: 2})
    const colorText = useColorModeValue('black', 'black')
    
    return (
    <Box minHeight="80vh" bg={useColorModeValue('gray.200', 'gray.200')} margin={1} borderWidth='1px' borderRadius='lg'>
        {/* <Container p={3}>
            <>
            {announcement.mime_type === 'image/gif' ? (
                <video autoPlay={true} src={props.nft && announcement.image != '' ? NFT.resolveUrl(announcement.image) : 'placeholder.png'}>
                    <source src={props.nft && announcement.image != '' ? NFT.resolveUrl(announcement.image) : 'placeholder.png'} type="video/mp4" />
                </video>
            ) : (
                <Image alt='press.algo' src={announcement && announcement.image != '' ? NFT.resolveUrl(announcement.image) : 'placeholder.png'} />
            )}
            </>
        </Container> */}
        <Container p={1} centerContent>
            <Text fontSize='xs' color={colorText} noOfLines={1}>
                <Link href={announcement.link}>{announcement.name}</Link>
            </Text>
        </Container>
        <Container p={1} centerContent bg={useColorModeValue('gray.700', 'gray.700')} borderBottomLeftRadius='lg' borderBottomRightRadius='lg'>
            <Box pl={{ base: 0, md: 1}} pr={{ base: 0, md: 1}}>
            {announcement.announcements.length > 0 ? (
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)"}}
                    gap={1}
                    px={{ base: 0, md: 1}}
                    mt={{ base: 0, md: 1}}
                > 
                    {announcement.announcements.map((announcement) => (
                        <GridItem colSpan={colSpan} key={announcement.id}>
                            <AnnouncementCard key={announcement.id} 
                                        announcement={announcement}  
                                        defaultWallet={defaultWallet}
                                        connected={connected} />
                        </GridItem>
                    ))}
                </Grid>
            ) : (
                <Container p={2} centerContent>
                    <Text color={colorText}>No Articles</Text>
                </Container>
            )} 
            </Box>
        </Container>
    </Box> 
    )

}