import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  VStack,
  Center,
  Fade,
  Button,
  Grid, 
  GridItem,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Spinner,
  Text
} from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { platform_settings as ps } from '../lib/platform-conf'
import favicon from "../public/favicon.ico"
import { useRouter } from 'next/router'

export default function Admin(props) {
  const { defaultWallet, sessionWallet, connected, updateWallet } = useNavigation()
  const colorText = useColorModeValue('black', 'white')
  const color1 = useColorModeValue('red', 'red')
  const router = useRouter()

  function redirectPage() { 
    router.push("/create");
  }

  if (connected && ps.application.admin_addr !== defaultWallet) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Admin - press.algo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
             Access Denied
            </Heading>
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz/">
                FlippingAlgos
              </Link>
            </Text>
          </VStack>
        </Center>
      </Container>
    </>
    );
  }
  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Admin - press.algo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect your Wallet
            </Heading>
           <AlgorandWalletConnector 
                        darkMode={true}
                        //@ts-ignore
                        sessionWallet={sessionWallet}
                        connected={connected} 
                        //@ts-ignore
                        updateWallet={updateWallet}
                        />
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz/">
                FlippingAlgos
              </Link>
            </Text>
          </VStack>
        </Center>
      </Container>
    </>
    );
  }
  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>Admin - press.algo</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
          <Box padding="2">
                <Heading textAlign="center">
                    Admin Dashboard
                </Heading>
                <Box p={4}>
                    <Center>
                      <Button size='sm' colorScheme={color1} onClick={redirectPage}><Text p={2} fontSize='xs'>Create Article</Text></Button>
                    </Center>
                </Box>
            </Box>
      </Container>
      <Footer />
    </>
  )
}
