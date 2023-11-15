import Head from 'next/head'
import {
  Box,
  Button,
  Heading,
  Container, 
  VStack,
  Center,
  Fade,
  Image,
  Flex,
  useBreakpointValue,
  useColorModeValue,
  Link,
  Spinner,
  Progress,
  Text
} from '@chakra-ui/react'
import NextLink from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import CreateRegistrationForm from "../components/forms/register"
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import favicon from "../public/favicon.ico"
import { useRouter } from 'next/router'
//import client from "../lib/apollo"
//import GET_CATEGORIES from "../queries/getCategories"
/* 
export async function getServerSideProps(context) {
  const { data } = await client.mutate({
    mutation: GET_CATEGORIES,
  });
  return {
    props: {
      //@ts-ignore
      categories: (data.queryCategories)? data.queryCategories : []
    }
  }
} 
*/

export default function Create(props) {
  //const { categories } = props
  const { defaultWallet, sessionWallet, connected, updateWallet,  } = useNavigation()
  const [stepError, setStepError] = React.useState(false)
  const [isStepTwo, setIsStepTwo] = React.useState(false)
  const [isNFTsent, setIsNFTsent] = React.useState(false)
  const colorText = useColorModeValue('black', 'white')
  const colorYellow = useColorModeValue('red', 'red')
  
  const [data, setData] = useState<{
    twitter: string;
    discord: string;
    profileimage: string;
    mimetype: string;
    name: string;
  }>()

  const router = useRouter()

  function redirectPage() { 
    router.push("/create");
  }

  React.useEffect(()=>{ 
    if(data === undefined || !connected) return 
      //console.log("form data sent", data)
      var now = new Date().toISOString()

     fetch('/api/registerCreator', {
        method: 'POST',
        body: JSON.stringify({
            twitter: (data.twitter)? data.twitter: null,
            discord: (data.discord)? data.discord: null,
            mimetype: (data.mimetype)? data.mimetype : null,
            profileimage: (data.profileimage)? data.profileimage : null,
            creator: defaultWallet,
            name: data.name,
            createdat: now
        })
    })
    .then((res) => {
        //console.log("creating Wallet Registerion")
        res.json().then((getStatus) => {
            //console.log("Registering Wallet", getStatus)
            if(getStatus.success) {
              setIsStepTwo(true)
              showNetworkSuccess("Wallet Successfully Registered")
            } else {
              setStepError(true)
              showErrorToaster("error registering wallet") 
            }
        }).catch((err)=>{ 
            console.log("error registering creator wallet", err)
            setStepError(true)
        })
    })
    
  }, [defaultWallet, connected, data])


  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Register New Creator - press.algo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container  maxWidth="100%" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect Your Wallet
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
      <title>Register New Creator - press.algo</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%">
        <Center h="100%">
          <Box padding="2">
              <Fade in={!data} unmountOnExit>
                <Box>
                <VStack>
                  <Box p={1}>
                    <Heading textAlign="center">
                        Register Creator Wallet
                    </Heading>
                  </Box>
                  <Box p={0}>
                      <Box p={1}>
                        <CreateRegistrationForm onRegistered={setData} />
                      </Box>
                  </Box>
                </VStack>
                </Box>
              </Fade>
              <Fade in={!!data} unmountOnExit>
                <Box maxWidth={"xl"}>
                    {!isStepTwo && !isNFTsent ? (
                        <>
                          <Box p={2}>
                              <Text fontSize='xs'>Attemping to register a creator wallet. This could take upto 15 seconds wait for the confirmation popup.</Text>
                          </Box>
                          <Box p={2}>
                            <Progress size='xs' isIndeterminate />
                          </Box>  
                          {stepError ? (
                          <>
                            <Box>
                                <Center>
                                  <Text fontSize='xs'>Looks like we ran into a issue. Please try registering again.</Text>
                                  <Button size='sm' colorScheme={colorYellow} onClick={redirectPage}><Text p={2} fontSize='xs'>Try Again</Text></Button>
                                </Center>
                            </Box>
                          </>
                          ) : null }
                        </>
                    ) : null }
                    {isStepTwo && !isNFTsent ? (
                        <>
                          <VStack>
                          <Box>
                              <Text p={2} fontWeight='semibold' color={'green'}>Success Your Wallet Is Now Registered</Text>
                          </Box>
                          <Box>
                              <NextLink href={'/create'} as={'/create'} passHref>
                                <a><Button colorScheme={colorYellow} >
                                     <Text px={2} zIndex={1}>Click Here To Create Content</Text>
                                  </Button></a>
                              </NextLink> 
                          </Box>
                          </VStack>
                      </>
                    ) : null }
                </Box>
              </Fade>
            </Box>
        </Center>
      </Box>
      <Footer />
    </>
  )
}
