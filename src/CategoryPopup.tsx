
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, 
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
    Modal, 
    ModalOverlay, 
    ModalBody, 
    ModalContent, 
    ModalHeader,
    HStack, 
    Input,
    Center, 
    Th, 
    Tr, 
    Td, 
    Tooltip, 
    useDisclosure,
    useBreakpointValue,
    useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet/dist'
import { useState, useEffect } from "react"
import { NFT } from '../lib/nft'
import { CloseIcon } from '@chakra-ui/icons'

type CategoryPopupProps = {
    defaultWallet: any;
    wallet: Wallet;
    categoryFilter: any;
    setCategoryFilter: any;
};

export function CategoryPopup(props: CategoryPopupProps) {
    //console.log("CategoryPopup",props)
    const { defaultWallet, categoryFilter, setCategoryFilter } = props;
    const [ filter, setFilter ] = useState('')
    const colSpan = useBreakpointValue({ base: 2, md: 1})
    const colorText = useColorModeValue('white', 'white')
    const [categories, setCategories] = React.useState([])
    const boxBgColor = useColorModeValue('#2d3748', '#d3de04')
    const borderColor = useColorModeValue('orange','yellow')
    const [filterUpdated, setFilterUpdated] = React.useState(false)
    const { isOpen: isSendOpen, onOpen: onSendOpen, onClose: onSendClose } = useDisclosure()
    const [walletSelectedCategories, setWalletSelectedCategories] = React.useState<string[]>(
        categoryFilter ? categoryFilter.split(",") : []
      )

    const handleFilterChange = async (e) => {
        setFilter(e.target.value)
    }

    const getCategories = async () => {
        const response = await fetch('/api/getCategories', {
            method: 'POST',
            body: JSON.stringify({first: 25, offset: 0})
        })
        const data = await response.json()
        setCategories(data.data.queryCategories)
        //console.log("CategoryPopup",data)
    }

    const closeModal = () => {
        //save wallet settings
        if(defaultWallet !== undefined && defaultWallet !== "" && filterUpdated){
            //console.log("SAVE WALLET PORTFOLIO")
            let walletPicksArray = walletSelectedCategories.filter((name) => name !== "").map((categoryname) => {
                return {
                    name: categoryname,
                    type: 'category'
                }
            });

            fetch('/api/updatePortfolio', {
                method: 'POST',
                body: JSON.stringify({
                    address: defaultWallet,
                    type: 'category',
                    selectedProjects: walletPicksArray
                })
            })
            .then((res) => {
                res.json().then((getStatus) => {
                    //console.log("updata data", getStatus)
                })
            })
            setFilterUpdated(false)
        }
        onSendClose() 
    }

    const handleProjectSelection = (event) => {
        const categoryName = event.currentTarget.innerText.replace(/\n\nX|\n/g, '').trim();
        //const categoryName = event.currentTarget.innerText.replace('\n\nX', '').replace('\n', '')
        if (!categoryName) {
            return; // ignore empty strings
        }
        setWalletSelectedCategories((prevFilter) => {
          if (prevFilter === undefined || prevFilter === null|| !prevFilter.includes(categoryName)) {
            return [...(prevFilter || []), categoryName];
          } else {
            return prevFilter.filter((category) => category !== categoryName);
          }
        })
        setFilterUpdated(true)
        updateCategoryFilter(categoryName)
    }

    const updateCategoryFilter = (categoryName) => {
        setCategoryFilter((prevFilter) => {
            if (!prevFilter) {
                return categoryName;
            } else if (!prevFilter.includes(categoryName)) {
                return `${prevFilter},${categoryName}`;
            } else {
                return prevFilter.split(",").filter((category) => category.trim() !== categoryName).join()
            }
        })
    }

    const categoriesCount = React.useMemo(() => {
        return walletSelectedCategories.length
    }, [walletSelectedCategories])

    useEffect(() => {
        if (categoryFilter === undefined || categoryFilter === "") return
            const newSelectedCategories = categoryFilter.split(",");
            setWalletSelectedCategories(newSelectedCategories);
    }, [categoryFilter])

    useEffect(() => {
        if (defaultWallet === undefined) return
            getCategories()
    }, [defaultWallet])

    useEffect(() => {
        if (!defaultWallet) {
            setWalletSelectedCategories([]);
        }
    }, [defaultWallet]);

    return (
        <Box p={2}>
           <Box h={'12'} as='button' color={'black'} borderWidth='0px' borderRadius='md' m={0} pr={2}>
               <Button size='sm' colorScheme={'red'} onClick={onSendOpen}>Categories {(categoriesCount > 0)? '(' + categoriesCount + ')' : ''}</Button>
           </Box>
           <Modal isCentered isOpen={isSendOpen} size={'3xl'} onClose={() => { closeModal() }}>
               <ModalOverlay backdropFilter='blur(10px)'/>
               <ModalContent alignItems='center' bgColor='grey' borderWidth='1.5px' borderRadius='lg'>
                   <ModalHeader color='white' fontSize='md' fontWeight='bold'>{(defaultWallet !== undefined && defaultWallet !== "")? 'Categories Followed By ' + defaultWallet.substring(0, 5) + '...' + defaultWallet.slice(-4) : 'Categories' } <Input value={filter} borderColor={borderColor} borderRadius='lg' size='sm' placeholder={'Search By Category Name'} w='200px' onChange={(e) => handleFilterChange(e)} /> </ModalHeader>
                   <ModalBody mb={2} p={0}>
                       <VStack justifyContent='center'>
                       <Box p={0}>
                       {walletSelectedCategories?.length > 0 ? (
                               <Grid
                                   templateRows="repeat(1, 1fr)"
                                   templateColumns="repeat(6, 1fr)"
                                   gap={1}
                                   p={0}
                               > 
                                   {walletSelectedCategories.map((categoryname) => (
                                       <GridItem colSpan={colSpan} key={categoryname}>
                                           <Button rightIcon={<CloseIcon w={2} h={2} />} onClick={handleProjectSelection} borderColor={'gray'} _hover={{borderColor: boxBgColor}} borderWidth='2px' borderRadius='lg' p={1} w={'100%'}>
                                               <Text p={0} fontSize='10px'>{categoryname}</Text>
                                           </Button>
                                       </GridItem>
                                   ))}
                               </Grid>
                           ) : (
                               <Container p={2} centerContent>
                                   <Text fontSize='xs'>No Categories Selected</Text>
                               </Container>
                           )} 
                       </Box>
                       <Box p={0}>
                       {categories.filter((p) => !walletSelectedCategories.includes(p.name))?.length > 0 ? (
                               <Grid
                                   templateRows="repeat(1, 1fr)"
                                   templateColumns="repeat(6, 1fr)"
                                   gap={1}
                                   p={0}
                                   mt={{ base: 0, md: 1}}
                               > 
                                   {categories.filter((c) => !walletSelectedCategories.includes(c.name)).filter(asa => ((asa.name.toString()).toLowerCase()).includes(filter.toLowerCase())).map((category) => (
                                       <GridItem colSpan={colSpan} key={category.id}>
                                           <Box onClick={handleProjectSelection} borderColor={'gray'} _hover={{borderColor: boxBgColor}} borderWidth='2px' borderRadius='lg' p={0} w={'100%'}>
                                               <VStack spacing={0}>
                                                   <Image boxSize='50px' objectFit='cover' borderRadius='lg' alt='press.algo' src={category && category.image != null ? NFT.resolveUrl(category.image) : 'placeholder.png'} />
                                                   <Text color={'white'} p={0} pt={1} fontSize='10px'>{category.name}</Text>
                                               </VStack>
                                           </Box>
                                       </GridItem>
                                   ))}
                               </Grid>
                           ) : (
                               <Container p={2} centerContent>
                                   <Text>No Categories Found</Text>
                               </Container>
                           )} 
                       </Box>
                       </VStack>
                       <HStack mt={6} alignItems='center' justifyContent='center'>
                           <Button size='sm' onClick={() => { closeModal() }}>X</Button>
                       </HStack>
                   </ModalBody>
               </ModalContent>
           </Modal>
       </Box>
       )

}