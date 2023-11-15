import React from "react"
import { Box, Icon, Center, Flex, Grid, Text, Spinner, VisuallyHidden, Checkbox, useColorModeValue, Textarea, HStack, VStack, FormErrorMessage, Link, Tooltip, Image, FormLabel, FormControl, Input, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigation } from "../../src/contexts/navigation.context"
import { NFT } from '../../lib/nft'

interface IRegistration {
  twitter: string;
  discord: string;
  profileimage: string;
  mimetype: string;
  name: string;
}

interface IRegisterFormProps {
  onRegistered: (data: IRegistration) => void;
}

export default function RegisterForm({ onRegistered }: IRegisterFormProps) {
  const {
    handleSubmit, // handels the form submit event
    register, // ties the inputs to react-form
    setValue,
    formState: { errors, isSubmitting }, // gets errors and "loading" state
  } = useForm()
  
  const { defaultWallet, loading } = useNavigation()
  const [input, setInput] = useState('')
  const [activeProfileImage, setActiveProfileImage] = useState('')
  const [assetMimeType, setAssetMimeType] = useState('')
  const createButtonColor = useColorModeValue('red', 'red')
  const [projectList, setProjectList] = React.useState([])
  const profileimage = register('profileimage', { required: true })

  const handleInputChange = async (e) => {
    setInput(e.target.value)
    setActiveProfileImage(e.target.value)
    if(e.target.value.length >= 5) {
        profileimage.onChange(e); // method from hook form register
    }
  }
  const handleFetchTokens = async () => {
    
    const response = await fetch('/api/getProjects', {
        method: 'POST',
        body: JSON.stringify({ first: 250, offset: 0, creator: defaultWallet})
    })
    const tokenData = await response.json()
    setProjectList(tokenData.data?.queryProjects)
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
         {projectList?.length <= 0 ? (
          <>
          <form onSubmit={handleSubmit(onRegistered)} noValidate>
            {/* noValidate will stop the browser validation, so we can write our own designs and logic */}
            <Flex>
                <Box p={2}>
                {projectList.length <= 0 ? (
                    <>
                    {assetMimeType === 'video/mp4' || assetMimeType === 'video/3gpp' ? (
                        <>
                        <Center p={2}>
                        <video className={'reactvidplayercreate'} autoPlay={false} src={activeProfileImage != '' ? NFT.resolveUrl(activeProfileImage) : 'placeholder.png'} controls>
                            <source src={activeProfileImage != '' ? NFT.resolveUrl(activeProfileImage) : 'placeholder.png'} type="video/mp4" />
                        </video>
                        </Center>
                        </>
                    ) : (
                        <>
                        <Center p={2}>
                            <Image boxSize='150px' objectFit='cover' borderRadius='lg' alt='Pressalgo' src={activeProfileImage != '' ? NFT.resolveUrl(activeProfileImage) : 'placeholder.png'} />
                        </Center>
                        </>
                    )}
                    <VisuallyHidden>
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
                    <FormControl isRequired isInvalid={errors.profileimage}>
                        <FormLabel fontSize='xs' htmlFor="profileimage">
                        Profile Image Url
                        {/* the form label from chakra ui is tied to the input via the htmlFor attribute */}
                        </FormLabel>
                        {/* you should use the save value for the id and the property name */}
                        <Input
                        id="profileimage"
                        {...profileimage }
                        size="sm"
                        value={input}
                        onChange={(e) => {
                        handleInputChange(e);
                        }}
                        placeholder="https://"
                        />
                        <FormErrorMessage>{errors.profileimage && errors.profileimage.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired isInvalid={errors.name}>
                        <FormLabel fontSize='xs' htmlFor="name">
                        <Tooltip hasArrow label={'Profile Name'} aria-label='Tooltip'>
                        Profile Name
                        </Tooltip>
                        </FormLabel>
                        <Input
                        id="name"
                        size="sm"
                        placeholder="Your Name Here"
                        {...register("name", {
                            required: "Enter the a Profile Name",
                        })}
                        ></Input>
                        <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize='xs' htmlFor="twitter">
                        Twitter
                        </FormLabel>
                        <Input
                            id="twitter"
                            size="sm"
                            {...register("twitter")}
                        ></Input>
                    </FormControl>
                    <FormControl>
                        <FormLabel fontSize='xs' htmlFor="discord">
                            Discord
                        </FormLabel>
                        <Input
                            id="discord"
                            size="sm"
                            {...register("discord")}
                        ></Input>
                    </FormControl>
                </Box>
            </Flex>
            <Center>
            <Button mt={10} colorScheme={createButtonColor} isLoading={isSubmitting} type="submit">
                Submit
            </Button>
            </Center>
            </form>
            </>
            ) : (
            <>
            <Center p={2}>
                Sorry Looks Like Your Wallet is Already Registered as a Creator.
            </Center>
            </>
            )}
          </>
        )}
    </Center>
  </>
  );
}