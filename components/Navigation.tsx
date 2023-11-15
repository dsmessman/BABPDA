import Link from 'next/link'
import * as React from 'react'
import {
    Box,
    Flex,
    Image,
    HStack,
    IconButton,
    Button,
    Menu,
    MenuItem,
    MenuButton,
    MenuList,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    useMediaQuery,
    useColorMode,
    Text,
    Stack,
  } from '@chakra-ui/react';
  import { useEffect, useState } from "react"
  import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon, InfoIcon } from '@chakra-ui/icons';
  import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
  import { RequestPopup } from '../src/RequestPopup'
  import { platform_settings as ps } from '../lib/platform-conf'
  import Logo from "../src/img/logo.svg";
  import { useNavigation } from "../src/contexts/navigation.context"
  import TokenDropdown from "./TokenDropdown"

  export default function Navigation() {
      
  const { defaultWallet, sessionWallet, connected, updateWallet, popupProps, tokenList, algoBalance, currency, setCurrency } = useNavigation();
  const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
  const { colorMode, toggleColorMode } = useColorMode();
  //@ts-ignore
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (colorMode === "dark") {
        toggleColorMode();
    }
  }, [colorMode,toggleColorMode]);
    return (
      <>
        <Box w={'100%'} bg={'#efefef'} px={{ base: 1, md: 4}}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={{ base: 4, md: 8}} alignItems={'center'}>
            <Box w={'300px'}><Link href="/" as="/"><a><Logo alt="press.algo" /></a></Link></Box>
            <HStack
              as={'nav'}
              spacing={4}
              width={'100%'}
              display={{ base: 'none', md: 'flex' }}>
              {connected ? (<Text color="#000000" fontSize='xs'><Link href="/dashboard" as="/dashboard">Categories / Creators</Link></Text>) : ''} 
            </HStack>
          </HStack>
          <Flex alignItems={'left'}>
            <Stack direction={'row'} spacing={{ base: 2, md: 7}}>
                <Box>
                  {connected && tokenList && isLargerThan768? (
                   <TokenDropdown text={(currency.unitname !== undefined)? currency.unitname : 'ALGO'} onChange={(value) => setCurrency(value)} options={tokenList} algoBalance={algoBalance} />
                  ) : null}
                </Box>
             {/*  <Button p={1} onClick={toggleColorMode}>
                  {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button> */}
              {isLargerThan768 ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}>
                    {isLargerThan768 ? ( <Button colorScheme={'gray'}>{(connected)? 'Connected' : 'Connect'}</Button> ) : ( <InfoIcon boxSize={6}/> )}
                  </MenuButton>
                  <MenuList>
                    <AlgorandWalletConnector 
                          darkMode={true}
                          //@ts-ignore
                          sessionWallet={sessionWallet}
                          connected={connected} 
                          //@ts-ignore
                          updateWallet={updateWallet}
                          />
                    <MenuDivider />
                    <Link href={'/'} as={'/'} passHref><MenuItem fontFamily='Atkinson Hyperlegible'>Home</MenuItem></Link>
                    <Link href={'/create'} as={'/create'} passHref><MenuItem fontFamily='Atkinson Hyperlegible'>Create</MenuItem></Link>
                    <Link href={'/mypurchases'} as={'/mypurchases'} passHref><MenuItem fontFamily='Atkinson Hyperlegible'>My Purchases</MenuItem></Link>
                    <Link href={'/dashboard'} as={'/dashboard'} passHref><MenuItem fontFamily='Atkinson Hyperlegible'>Categories / Creators</MenuItem></Link>
                    <Link href={'/activity'} as={'/activity'} passHref><MenuItem fontFamily='Atkinson Hyperlegible'>Activity</MenuItem></Link>
                  </MenuList>
                </Menu>
              ) : null}
            </Stack>
            </Flex>
        </Flex>
    
        {isOpen ? (
          <Box pl={1} pr={1} pb={2} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={{ base: 2, md: 4}}>
              <AlgorandWalletConnector 
                    darkMode={true}
                    //@ts-ignore
                    sessionWallet={sessionWallet}
                    connected={connected} 
                    //@ts-ignore
                    updateWallet={updateWallet}
                    />
              <Link href="/" as="/" passHref><Text color="#000000" fontSize='xs'>Home</Text></Link>
              {connected ? (<Text color="#ee1c99" fontSize='xs'><Link href="/create" as="/create">Create</Link></Text>) : ''}
              {connected ? (<Text color="#ee1c99" fontSize='xs'><Link href="/mypurchases" as="/mypurchases">My Purchases</Link></Text>) : ''}
              {connected ? (<Text color="#ee1c99" fontSize='xs'><Link href="/dashboard" as="/dashboard">Categories / Creators</Link></Text>) : ''}
              <Text color="#ee1c99" fontSize='xs'><Link href="/activity" as="/activity">Activity</Link></Text>
            </Stack>
          </Box>
        ) : null}
      </Box>
      {
        //@ts-ignore
      }
      <RequestPopup 
      //@ts-ignore 
      {...popupProps}/>
      </>
    )
}
