
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, 
    Container, 
    Text, 
    Grid,
    GridItem,
    Link, 
    Image, 
    Button, 
    VStack,
    Modal, 
    ModalOverlay, 
    ModalBody, 
    ModalContent, 
    ModalHeader,
    HStack, 
    Input,
    Center, 
    Tooltip, 
    useDisclosure,
    useBreakpointValue,
    useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet/dist'
import { useState, useEffect } from "react"
import { NFT } from '../lib/nft'
import { CloseIcon } from '@chakra-ui/icons';

type ProjectPopupProps = {
    defaultWallet: any;
    wallet: Wallet;
    pageFilter: any;
    setPageFilter: any;
};

export function ProjectPopup(props: ProjectPopupProps) {
    //console.log("ProjectPopup",props)
    const { defaultWallet, pageFilter, setPageFilter } = props;
    const [ filter, setFilter ] = useState('')
    const { isOpen: isSendOpen, onOpen: onSendOpen, onClose: onSendClose } = useDisclosure()
    const boxBgColor = useColorModeValue('#2d3748', '#d3de04')
    const borderColor = useColorModeValue('orange','yellow')
    const colSpan = useBreakpointValue({ base: 2, md: 1 })
    const [projects, setProjects] = React.useState([])
    const [walletSelectedProjects, setWalletSelectedProjects] = React.useState<string[]>(
        pageFilter ? pageFilter.split(",") : []
      );
    const [filterUpdated, setFilterUpdated] = React.useState(false)
    
    const handleFilterChange = async (e) => {
        setFilter(e.target.value)
    }

    const closeModal = () => {
        //save wallet settings
        if(defaultWallet !== undefined && defaultWallet !== "" && filterUpdated){
            //console.log("SAVE WALLET PORTFOLIO")
            let walletPicksArray = walletSelectedProjects.filter((name) => name !== "").map((projectname) => {
                return {
                    name: projectname,
                    type: 'project'
                }
            });

            fetch('/api/updatePortfolio', {
                method: 'POST',
                body: JSON.stringify({
                    address: defaultWallet,
                    type: 'project',
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
        const projectName = event.currentTarget.innerText.replace(/\n\nX|\n/g, '').trim();
        //const projectName = event.currentTarget.innerText.replace('\n\nX', '').replace('\n', '')
        if (!projectName) {
            return; // ignore empty strings
        }
        setWalletSelectedProjects((prevFilter) => {
          if (prevFilter === undefined || prevFilter === null|| !prevFilter.includes(projectName)) {
            return [...(prevFilter || []), projectName];
          } else {
            return prevFilter.filter((project) => project !== projectName);
          }
        })
        setFilterUpdated(true)
        updatePageFilter(projectName)
    }

    const updatePageFilter = (projectName) => {
        setPageFilter((prevFilter) => {
            if (!prevFilter) {
                return projectName;
            } else if (!prevFilter.includes(projectName)) {
                return `${prevFilter},${projectName}`;
            } else {
                return prevFilter.split(",").filter((project) => project.trim() !== projectName).join()
            }
        })
    };
    

    const projectsCount = React.useMemo(() => {
        return walletSelectedProjects.length
    }, [walletSelectedProjects])

    const getProjects = async () => {
        const response = await fetch('/api/getProjects', {
            method: 'POST',
            body: JSON.stringify({ first: 35, offset: 0 })
        })
        const data = await response.json()
        setProjects(data.data.queryProjects)
    }

    useEffect(() => {
        if (pageFilter === undefined || pageFilter === "") return
            const newSelectedProjects = pageFilter.split(",");
            setWalletSelectedProjects(newSelectedProjects);
    }, [pageFilter])

    useEffect(() => {
        if (defaultWallet === undefined) return
            getProjects()
    }, [defaultWallet])

    useEffect(() => {
        if (!defaultWallet) {
          setWalletSelectedProjects([]);
        }
    }, [defaultWallet]);
      

    return (
     <Box p={2}>
        <Box h={'12'} as='button' color={'black'} borderWidth='0px' borderRadius='md' m={0} pr={2}>
            <Button size='sm' colorScheme={'red'} onClick={onSendOpen}>Creators {(projectsCount > 0)? '(' + projectsCount + ')' : ''}</Button>
        </Box>
        <Modal isCentered isOpen={isSendOpen} size={'3xl'} onClose={() => { closeModal() }}>
            <ModalOverlay backdropFilter='blur(10px)'/>
            <ModalContent alignItems='center' bgColor='grey' borderWidth='1.5px' borderRadius='lg'>
                <ModalHeader color='white' fontSize='md' fontWeight='bold'>{(defaultWallet !== undefined && defaultWallet !== "")? 'Creators Followed By ' + defaultWallet.substring(0, 5) + '...' + defaultWallet.slice(-4) : 'Creators' } <Input value={filter} borderColor={borderColor} borderRadius='lg' size='sm' placeholder={'Search By Creator Name'} w='200px' onChange={(e) => handleFilterChange(e)} /> </ModalHeader>
                <ModalBody mb={2} p={0}>
                    <VStack justifyContent='center'>
                    <Box p={0}>
                    {walletSelectedProjects?.length > 0 ? (
                            <Grid
                                templateRows="repeat(1, 1fr)"
                                templateColumns="repeat(6, 1fr)"
                                gap={1}
                                p={0}
                            > 
                                {walletSelectedProjects.map((projectname) => (
                                    <GridItem colSpan={colSpan} key={projectname}>
                                        <Button rightIcon={<CloseIcon w={2} h={2} />} onClick={handleProjectSelection} borderColor={'gray'} _hover={{borderColor: boxBgColor}} borderWidth='2px' borderRadius='lg' p={1} w={'100%'}>
                                            <Text p={0} fontSize='10px'>{projectname}</Text>
                                        </Button>
                                    </GridItem>
                                ))}
                            </Grid>
                        ) : (
                            <Container p={2} centerContent>
                                <Text fontSize='xs'>No Creators Selected</Text>
                            </Container>
                        )} 
                    </Box>
                    <Box p={0}>
                    {projects.filter((p) => !walletSelectedProjects.includes(p.name))?.length > 0 ? (
                            <Grid
                                templateRows="repeat(1, 1fr)"
                                templateColumns="repeat(6, 1fr)"
                                gap={1}
                                p={0}
                                mt={{ base: 0, md: 1}}
                            > 
                                {projects.filter((p) => !walletSelectedProjects.includes(p.name)).filter(asa => ((asa.name.toString()).toLowerCase()).includes(filter.toLowerCase())).map((project) => (
                                    <GridItem colSpan={colSpan} key={project.id}>
                                        <Box onClick={handleProjectSelection} borderColor={'gray'} _hover={{borderColor: boxBgColor}} borderWidth='2px' borderRadius='lg' p={0} w={'100%'}>
                                            <VStack spacing={0}>
                                                <Image boxSize='50px' objectFit='cover' borderRadius='lg' alt='press.algo' src={project && project.image != null ? NFT.resolveUrl(project.image) : 'placeholder.png'} />
                                                <Text color={'white'} p={0} pt={1} fontSize='10px'>{project.name}</Text>
                                            </VStack>
                                        </Box>
                                    </GridItem>
                                ))}
                            </Grid>
                        ) : (
                            <Container p={2} centerContent>
                                <Text>No Creators Found</Text>
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