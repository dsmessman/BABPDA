import Head from 'next/head'
import {
  Box,
  Grid,
  GridItem,
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
import client from "../lib/apollo"
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import favicon from "../public/favicon.ico"
import CreateAnnouncementForm from "../components/forms/form"
import GET_CATEGORIES from "../queries/getCategories"
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import { useRouter } from 'next/router'
import { NFT } from '../lib/nft'
import { WEB3 } from '../lib/web3'

export async function getServerSideProps(context) {
  //console.log("CONTEXTQUERY", context.query)
  const { data } = await client.mutate({
    mutation: GET_CATEGORIES,
  });
  //console.log("data", data)
  return {
    props: {
      //@ts-ignore
      categories: (data.queryCategories)? data.queryCategories : []
    }
  }
}

export default function Create(props) {
  const { categories } = props
  const { defaultWallet, sessionWallet, connected, updateWallet, currency  } = useNavigation()
  const [stepError, setStepError] = React.useState(false)
  const [isStepTwo, setIsStepTwo] = React.useState(false)
  const [isNFTsent, setIsNFTsent] = React.useState(false)
  const colorText = useColorModeValue('black', 'white')
  const colorYellow = useColorModeValue('red', 'red')
  const colSpan = useBreakpointValue({ base: 2, md: 1})
  const boxBgColor = useColorModeValue('#d3de04', '#d3de04')
  const [walletSelectedCategory, setWalletSelectedCategory] = React.useState<string>('')
  
  const [data, setData] = useState<{
    categoryname: string;
    projectname: string;
    projectimage: string;
    mimetype: string;
    contentpreview: string;
    content: string;
    cost: string;
    seller_wallet: string;
  }>()

  const router = useRouter()

  const handleCategorySelection = (event) => {
    const categoryName = event.currentTarget.innerText.replace(/\n\nX|\n/g, '').trim();
    if (!categoryName) {
        return; // ignore empty strings
    }
    setWalletSelectedCategory(categoryName)
  }

  function redirectPage() { 
    router.push("/");
  }

  React.useEffect(()=>{ 
    if(data === undefined || !connected) return 
      //console.log("form data sent", data)
      const txArticle = async () => {
        if (data === undefined || !connected) return;
        try {
            await WEB3.createArticle(sessionWallet, currency).then((txid: any) => {
              //console.log("verified", txid)
              if(txid && txid !== undefined) {
                var now = new Date().toISOString()
                var encodedJsonObject = Buffer.from(JSON.stringify(txid)).toString('base64'); 
                fetch('/api/createArticle', {
                    method: 'POST',
                    body: JSON.stringify({
                        txBlob: encodedJsonObject,
                        name: data.categoryname,
                        seller_wallet: data.seller_wallet,
                        cost: data.cost,
                        projectname: data.projectname,
                        mimetype: (data.mimetype)? data.mimetype : null,
                        contentpreview: (data.contentpreview)? data.contentpreview: null,
                        content:data.content,
                        createdat: now
                    })
                })
                .then((res) => {
                    //console.log("creating announcement")
                    res.json().then((getStatus) => {
                        //console.log("creating article", getStatus)
                        if(getStatus.success) {
                          setIsStepTwo(true)
                          showNetworkSuccess("Article Created Successfully")
                        } else {
                          setStepError(true)
                          showErrorToaster("error creating article") 
                        }
                    }).catch((err)=>{ 
                        console.log("error creating article", err)
                        setStepError(true)
                    })
                })
              } else {
                setStepError(false)
              }
          }).catch((err)=>{ 
              console.log("error purchasing", err)
              setStepError(false)
              redirectPage();
          })
        } catch (error) {
          console.error("Error creating article:", error);
        }
      };

      txArticle()
      // Optionally, you can return a cleanup function here if needed
      return () => {
        // Cleanup logic here (if applicable)
      };
    
  }, [defaultWallet, connected, data])


  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Create New Article - press.algo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
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
      <title>Create New Article - press.algo</title>
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
                        Create New Article
                    </Heading>
                  </Box>
                  <Box p={0}>
                      <Box p={1}>
                       {walletSelectedCategory === '' ? (
                        <>
                        {categories?.length > 0 ? (
                            <Grid
                                templateRows="repeat(1, 1fr)"
                                templateColumns="repeat(4, 1fr)"
                                gap={{ base: 1, md: 3}}
                                p={0}
                                mt={{ base: 1, md: 2}}
                            > 
                            {categories.map((category) => (
                              <GridItem colSpan={colSpan} key={category.id}>
                                  <Box onClick={handleCategorySelection} borderColor={'gray'} _hover={{borderColor: boxBgColor}} borderWidth='2px' borderRadius='lg' p={1} w={'100%'}>
                                      <VStack spacing={4}>
                                          <Image boxSize='75px' objectFit='cover' borderRadius='lg' alt='press.algo' src={category && category.image != null ? NFT.resolveUrl(category.image) : 'placeholder.png'} />
                                          <Text color={'black'} p={0} pt={1} fontSize='11px'>{category.name}</Text>
                                      </VStack>
                                  </Box>
                              </GridItem>
                            ))}
                            </Grid>
                        ) : (
                            <Container p={2} centerContent>
                                <Text>No Categories Found. Please Try reloading the page</Text>
                            </Container>
                        )} 
                        </>
                      ) : (
                        <CreateAnnouncementForm walletSelectedCategory={walletSelectedCategory} onRegistered={setData} />
                      )} 
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
                              <Text fontSize='xs'>Attemping to create a New Article. This could take upto 15 seconds wait for the confirmation popup.</Text>
                          </Box>
                          <Box p={2}>
                            <Progress size='xs' isIndeterminate />
                          </Box>  
                          {stepError ? (
                          <>
                            <Box>
                                <Center>
                                  <Text fontSize='xs'>Looks like we ran into a issue. Double check your Article to confirm and if its not there try creating it again.</Text>
                                  <Button size='sm' colorScheme={colorYellow} onClick={redirectPage}><Text p={2} fontSize='xs'>Check Live Articles</Text></Button>
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
                              <Text p={2} fontWeight='semibold' color={'green'}>Success Your Article Is Now Live</Text>
                          </Box>
                          <Box>
                              <NextLink href={'/'} as={'/'} passHref>
                                <a><Button colorScheme={colorYellow} >
                                     <Text px={2} zIndex={1}>Click Here To View Live Articles</Text>
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
