
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
    Popover,
    PopoverContent,
    PopoverCloseButton,
    PopoverHeader,
    PopoverTrigger,
    PopoverArrow,
    PopoverBody,
    Th, 
    Tr, 
    Td, 
    Tooltip, 
    useDisclosure,
    useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet/dist';
import { useState, useEffect } from "react"
import { NFT } from '../lib/nft'

type AnnouncementCardProps = {
    announcement: any;
    defaultWallet: any;
    connected: any;
};

export function AnnouncementCard(props: AnnouncementCardProps) {
    //console.log("AnnouncementCard",props)
    const { defaultWallet, announcement, connected } = props;
    const colorText = useColorModeValue('white', 'white')
    const { isOpen, onOpen, onClose } = useDisclosure()
    const finalRef = React.useRef(null)
    
    const formatDate = (sourceDate: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: "long", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
    }
    return (
        <Box bg={useColorModeValue('gray.500', 'gray.500')} margin={1} borderWidth='1px' borderRadius='lg'>
            <Stack direction={{ sm: 'row',  md: 'column', lg: 'column', xl: 'column'}}>
                {announcement?.image != null ? (
                <Box p={{ base: 0, md: 1}} w='auto'>
                    <Center>
                    {announcement.mime_type === 'image/gif' ? (
                        <video className={'reactvidplayer'} autoPlay={true} src={announcement.image != '' ? NFT.resolveUrl(announcement.image) : 'placeholder.png'}>
                            <source src={announcement && announcement.image != '' ? NFT.resolveUrl(announcement.image) : 'placeholder.png'} type="video/mp4" />
                        </video>
                    ) : (
                        <Image margin={0} borderRadius='lg' maxWidth={{ base: '100px', md: '120px',xl: '100px', xxl: '130px'}} boxSize={{ base: '100px', md: '120px', xl: '100px', xxl: '130px'}}  alt='press.algo' src={announcement.image != '' ? NFT.resolveUrl(announcement.image) : 'placeholder.png'} />
                    )}
                    </Center>
                </Box>
                ) : null }
                <Box p={{ base: 0, md: 1}} maxWidth={{ base: (announcement?.image != null)? '60%' : '100%', md: '100%'}}>
                    <Container pl={2} pt={1}>
                        <Text fontSize='11px' color={colorText} noOfLines={1}>
                        <Link href={'article?id='+announcement.articleid}>{announcement.projectname}</Link>
                        </Text>
                    </Container>
                    <Container pl={2}>
                        <Text p={0} fontSize='9px' color={colorText}>{formatDate(announcement.createdat)}</Text>
                    </Container>
                    <Container p={2}>
                        <Popover trigger='hover' variant="rounded">
                        <PopoverTrigger>
                        <Text fontSize='xs' color={colorText} noOfLines={3}>
                            {announcement.contentpreview}
                        </Text>
                        </PopoverTrigger>
                        <PopoverContent bgColor='gray.800' width={{ base: '275px', md: '400px'}}>
                            <PopoverHeader color={'white'} fontWeight='semibold'>{announcement.projectname}</PopoverHeader>
                            <PopoverArrow />
                            <PopoverCloseButton color={'white'} />
                            <PopoverBody fontSize='xs' color={'white'}>
                            {announcement.contentpreview}
                            </PopoverBody>
                        </PopoverContent>
                        </Popover>
                    </Container>
                </Box>
            </Stack>
        </Box> 
    )

}