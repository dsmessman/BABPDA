import React from "react"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { Box, Center, Flex, Text, Image, FormErrorMessage, FormLabel, FormControl, Input, Button, Radio, RadioGroup, VStack, HStack, Tooltip } from "@chakra-ui/react"
import { NFT } from '../../lib/nft'

interface IRegistration {
  assetId: string;
  name: string;
  image: string;
  unitname: string;
  description: string;
  reserve: string;
  website: string;
}

interface IAdminFormProps {
  onRegistered: (data: IRegistration) => void;
}

export default function AdminForm({ onRegistered }: IAdminFormProps) {
  const {
    handleSubmit, // handels the form submit event
    register, // ties the inputs to react-form
    formState: { errors, isSubmitting }, // gets errors and "loading" state
  } = useForm();

  const [input, setInput] = useState('')
  const [radio, setRadio] = useState('normal')
  const [assetName, setAssetName] = useState('')
  const [assetImage, setAssetImage] = useState('')
  const [assetUnitName, setAssetUnitName] = useState('')
  const [assetDescription, setAssetDescription] = useState('')
  const [assetReserve, setAssetReserve] = useState('')
  const assetId = register('assetId', { required: true })

  const handleInputChange = async (e) => {
    setInput(e.target.value)
    setAssetName('')
    setAssetImage('')
    setAssetUnitName('')
    setAssetDescription('')
    setAssetReserve('')
    if(e.target.value.length >= 8 && !isNaN(Number(e.target.value))) {
        assetId.onChange(e); // method from hook form register
        const response = await fetch("https://api.algoxnft.com/v1/assets/"+e.target.value)
        const tokenData = await response.json()
        setAssetName(tokenData.name)
        setAssetUnitName(tokenData.unit_name)
        setAssetDescription(tokenData?.collection_description)
        setAssetReserve(tokenData.reserve)
        if(tokenData.url !== null) {
            setAssetImage(tokenData.url)
        }
    } else {
        const assetId = register('assetId', { required: "Don't forget the Asset ID" })
        assetId.onChange(e); // method from hook form register
    }
  }

  //const isError = input === ''

  return (
    <form onSubmit={handleSubmit(onRegistered)} noValidate>
      {/* noValidate will stop the browser validation, so we can write our own designs and logic */}
      <Flex>
         <Box p={2}>
        <FormControl isRequired isInvalid={errors.assetId}>
            <FormLabel htmlFor="assetId">
            Asset ID
            {/* the form label from chakra ui is tied to the input via the htmlFor attribute */}
            </FormLabel>
            {/* you should use the save value for the id and the property name */}
            <Input
            id="assetId"
            {...assetId}
            placeholder="1011327312"
            value={input}
            onChange={(e) => {
              handleInputChange(e);
            }}
            ></Input>
            {/* react-form will calculate the errors on submit or on dirty state */}
            <FormErrorMessage>{errors.assetId && errors.assetId.message}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired isInvalid={errors.name}>
            <FormLabel htmlFor="name">
            Name
            </FormLabel>
            <Input
            id="name"
            value={assetName}
            placeholder="#1"
            {...register("name", {
                required: "Please enter a Name",
            })}
            ></Input>
            <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired isInvalid={errors.image}>
            <FormLabel htmlFor="image">
            Image
            </FormLabel>
            <Input
            id="image"
            value={assetImage}
            {...register("image", {
                required: "Please enter a Image / IPFS Url",
            })}
            ></Input>
            <FormErrorMessage>{errors.image && errors.image.message}</FormErrorMessage>
        </FormControl>
        <Center p={2}>
            <Image boxSize='150px' objectFit='cover' borderRadius='lg' alt='press.algo' src={assetImage != '' ? NFT.resolveUrl(assetImage) : 'placeholder.png'} />
        </Center>
      </Box>
      <Box p={2}>
            <FormControl isRequired isInvalid={errors.unitname}>
                <FormLabel htmlFor="unitname">
                Unit Name
                </FormLabel>
                <Input
                id="unitname"
                placeholder="TT001"
                value={assetUnitName}
                {...register("unitname", {
                    required: "Please enter the UnitName",
                })}
                ></Input>
                <FormErrorMessage>{errors.unitname && errors.unitname.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={errors.description}>
                <FormLabel htmlFor="description">
                Description
                </FormLabel>
                <Input
                id="description"
                placeholder="NFT Collection"
                value={assetDescription}
                {...register("description", {
                    required: "Please enter the description",
                })}
                ></Input>
                <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={errors.website}>
                <FormLabel htmlFor="website">
                    Website
                </FormLabel>
                <Input
                id="website"
                placeholder="https://press.algo/"
                type="website"
                {...register("website", {
                    required: "Please enter URL for the project website",
                })}
                ></Input>
                <FormErrorMessage>{errors.website && errors.website.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={errors.reserve}>
                <FormLabel htmlFor="reserve">Reserve Address</FormLabel>
                <Input
                id="reserve"
                placeholder=""
                value={assetReserve}
                {...register("reserve", {
                    required: "Please enter reserve Address",
                })}
                ></Input>
                <FormErrorMessage>{errors.reserve && errors.reserve.message}</FormErrorMessage>
            </FormControl>
         </Box>
      </Flex>
      <Center>
      <Button mt={10} colorScheme="pink" isLoading={isSubmitting} type="submit">
        Add Whitelist
      </Button>
      </Center>
    </form>
  );
}