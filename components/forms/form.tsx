import React from "react"
import { Box, Icon, Center, Flex, Grid, Text, Spinner, VisuallyHidden, Checkbox, useColorModeValue, Textarea, HStack, VStack, FormErrorMessage, Link, Tooltip, Image, FormLabel, FormControl, Input, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigation } from "../../src/contexts/navigation.context"
import { NFT } from '../../lib/nft'
import NextLink from 'next/link'

interface IRegistration {
  categoryname: string;
  projectname: string;
  projectimage: string;
  mimetype: string;
  contentpreview: string;
  content: string;
  cost: string;
  seller_wallet: string;
}

interface IFormProps {
  onRegistered: (data: IRegistration) => void;
  walletSelectedCategory: any;
}

export default function Form({ onRegistered, walletSelectedCategory }: IFormProps) {
  const {
    handleSubmit, // handels the form submit event
    register, // ties the inputs to react-form
    setValue,
    formState: { errors, isSubmitting }, // gets errors and "loading" state
  } = useForm()
  
  const { defaultWallet, loading } = useNavigation()
  const [projectName, setProjectName] = useState('')
  const [projectImage, setProjectImage] = useState('')
  const [assetMimeType, setAssetMimeType] = useState('')
  const createButtonColor = useColorModeValue('red', 'red')
  const [projectList, setProjectList] = React.useState([])
  const colorRed = useColorModeValue('red', 'red')
  setValue("categoryname", walletSelectedCategory)
  setValue("seller_wallet", defaultWallet)

  const handleFetchTokens = async () => {
    
    const response = await fetch('/api/getProjects', {
        method: 'POST',
        body: JSON.stringify({ first: 35, offset: 0, creator: defaultWallet})
    })
    const tokenData = await response.json()
    setProjectList(tokenData.data?.queryProjects)
    if(tokenData.data?.queryProjects.length > 0){
        setProjectName(tokenData.data?.queryProjects[0]?.name)
        setValue("projectname", tokenData.data?.queryProjects[0]?.name)
        setProjectImage(tokenData.data?.queryProjects[0]?.image)
    }
  }

  React.useEffect(()=>{ 
    if(defaultWallet === undefined || !defaultWallet) return 
        handleFetchTokens()
    }, [defaultWallet])

  return (
    <>
    <Center>
    {!loading ? (
          <>
          <Box mt='2'>
            <Center>
              <VStack><Text fontSize='xl'>Loading Wallet Information...</Text><Spinner size='xl'/></VStack>
            </Center>
          </Box>
          </>
        ) : (
         <>
         {projectList?.length > 0 ? (
          <>
          <form onSubmit={handleSubmit(onRegistered)} noValidate>
            {/* noValidate will stop the browser validation, so we can write our own designs and logic */}
            <Flex>
                <Box p={2}>
                {projectList.length > 0 ? (
                    <>
                    {assetMimeType === 'video/mp4' || assetMimeType === 'video/3gpp' ? (
                        <>
                        <Center p={2}>
                        <video className={'reactvidplayercreate'} autoPlay={false} src={projectImage != '' ? NFT.resolveUrl(projectImage) : 'placeholder.png'} controls>
                            <source src={projectImage != '' ? NFT.resolveUrl(projectImage) : 'placeholder.png'} type="video/mp4" />
                        </video>
                        </Center>
                        </>
                    ) : (
                        <>
                        <Center p={2}>
                            <Image boxSize='150px' objectFit='cover' borderRadius='lg' alt='Flipping Algos' src={projectImage != '' ? NFT.resolveUrl(projectImage) : 'placeholder.png'} />
                        </Center>
                        </>
                    )}
                    <FormControl isReadOnly>
                        <FormLabel fontSize='xs' htmlFor="categoryname">
                        Selected Category
                        </FormLabel>
                        <Input
                            id="categoryname"
                            size="sm"
                            value={walletSelectedCategory}
                            {...register("categoryname")}
                        ></Input>
                    </FormControl>
                    <FormControl isReadOnly>
                        <FormLabel fontSize='xs' htmlFor="projectname">
                            Creator Name
                        </FormLabel>
                        <Input
                            id="projectname"
                            size="sm"
                            value={projectName}
                            {...register("projectname")}
                        ></Input>
                    </FormControl>
                    <VisuallyHidden>
                    <FormControl isReadOnly>
                        <FormLabel fontSize='xs' htmlFor="projectimage">
                            Project Image
                        </FormLabel>
                        <Input
                            id="image"
                            size="sm"
                            value={projectImage}
                            {...register("projectimage")}
                        ></Input>
                    </FormControl>
                    {assetMimeType !=="" ? (
                    <FormControl isReadOnly>
                        <FormLabel fontSize='xs' htmlFor="mimetype">
                            MimeType
                        </FormLabel>
                        <Input
                            id="mimetype"
                            size="sm"
                            value={assetMimeType}
                            {...register("mimetype")}
                        ></Input>
                    </FormControl>
                    ) : null}
                    </VisuallyHidden>
                    </>
                ) : null}
            </Box>
            <Box p={2}>
                    <FormControl isRequired isInvalid={errors.cost}>
                        <FormLabel fontSize='xs' htmlFor="cost">
                        <Tooltip hasArrow label={'Cost'} aria-label='Tooltip'>
                        Cost
                        </Tooltip>
                        </FormLabel>
                        <Input
                            id="cost"
                            size="sm"
                            {...register("cost", {
                                required: "a cost is required",
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: 'Please enter a number',
                                },
                                min: {
                                    value: 1,
                                    message: "Cost Must be atleast 1 Algo"
                                },
                                max: {
                                    value: 10,
                                    message: "Cost Cannot be more then 10 Algo"
                                },
                            })}
                        ></Input>
                        <FormErrorMessage>{errors.cost && errors.cost.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired isInvalid={errors.contentpreview}>
                        <FormLabel fontSize='xs' htmlFor="contentpreview">
                        <Tooltip hasArrow label={'Content Preview'} aria-label='Tooltip'>
                         Preview
                        </Tooltip>
                        </FormLabel>
                        <Textarea
                        id="contentpreview"
                        size="md"
                        placeholder="Input Content Preview Here"
                        {...register("contentpreview", {
                            required: "a Content Preview is required",
                        })}
                        ></Textarea>
                        <FormErrorMessage>{errors.contentpreview && errors.contentpreview.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired isInvalid={errors.content}>
                        <FormLabel fontSize='xs' htmlFor="content">
                        Content
                        </FormLabel>
                        <Textarea
                        id="content"
                        size="lg"
                        minH="unset"
                        overflow="hidden"
                        w="100%"
                        h="200px"
                        resize="none"
                        placeholder="Input Content Here"
                        {...register("content", {
                            required: "a description is required",
                        })}
                        ></Textarea>
                        <FormErrorMessage>{errors.content && errors.content.message}</FormErrorMessage>
                    </FormControl>
                </Box>
            </Flex>
            <Center>
                <Text mt={4} color={'black'} p={0} pt={1} fontSize='11px'>** There is a 1 ALGO Listing fee</Text>
            </Center>
            <Center>
            <Button mt={2} colorScheme={createButtonColor} isLoading={isSubmitting} type="submit">
                Submit
            </Button>
            </Center>
            </form>
            </>
            ) : (
            <>
            <VStack p={2} alignContent={'center'}>
                <Text>Sorry Your Wallet is Not Registered as a Creator at this Time. Please click below to complete the registration process</Text>
                <NextLink href={'/register'} as={'/register'} passHref>
                <a><Button colorScheme={colorRed} >
                        <Text px={2} zIndex={1}>Click Here To Register</Text>
                    </Button></a>
                </NextLink> 
            </VStack>
            </>
            )}
          </>
        )}
    </Center>
  </>
  );
}