import React, { useState } from "react"
import {
  Input,
  Box,
  Text,
  Flex,
  Image,
  HStack,
  VStack,
  Spacer,
  Popover,
  PopoverTrigger,
  PopoverContent,
  InputGroup,
  useColorModeValue,
  InputRightElement
} from "@chakra-ui/react"
import { ArrowUpDownIcon } from "@chakra-ui/icons"

function TokenDropdown({ text, onChange, options, algoBalance }) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  function selectOption(value) {
    onChange(value)
    setPopoverOpen(false)
  }

  return (
    <Box w={"full"} pl={1} pr={1}>
      <Popover isOpen={popoverOpen} autoFocus={false} matchWidth>
        <PopoverTrigger>
          <InputGroup>
            <Input
              type={"text"}
              value={text}
              readOnly
              autoComplete="off"
              onClick={() => {popoverOpen ? (setPopoverOpen(false)) : (setPopoverOpen(true))}}
              color={"black"}
              isRequired={true}
            />
            <InputRightElement>
              <ArrowUpDownIcon
                boxSize={"4"}
                color={"black"}
                _hover={{ cursor: "pointer", boxSize: "19px" }}
                onClick={() => {popoverOpen ? (setPopoverOpen(false)) : (setPopoverOpen(true))}}
              />
            </InputRightElement>
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent w={"100%"}>
          <Box py={1} px={1}>
              <Flex
                _hover={{ bgColor: "gray.50", textColor: "black", cursor: "pointer" }}
                my={1}
                borderRadius={"md"}
                bgColor={text === "ALGO" ? "#4299e1" : "#f1f1f1"}
                textColor={text === "ALGO" ? "white" : "black"}
                onClick={() => selectOption({asset_id: 0, decimal: 6, unitname:"ALGO", rate:"1"})}
                pl={2}
                pr={2}>
                <Box p='1'>
                  <HStack>
                  <Image boxSize='25px' objectFit='cover' borderRadius='lg' alt='Algorand' src={'currencies/algo.png'} />
                  <Text
                    fontStyle={"revert"}
                    fontWeight={"hairline"}
                    _hover={{ fontWeight: "normal" }}
                  >
                    ALGO
                  </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Box p='0'>
                  <VStack>
                    <Text fontSize='xs' color={'gray.300'}>BALANCE</Text> 
                    <Text fontSize='xs' mt={0}>{(algoBalance)? (algoBalance / Math.pow(10, 6)).toFixed(2) : 'loading...'}</Text>
                  </VStack>
                </Box>
              </Flex>
            {options.map((value, i) => (
              <Flex
                key={i}
                _hover={{ bgColor: "gray.50", textColor: "black", cursor: "pointer" }}
                my={1}
                borderRadius={"md"}
                bgColor={text === value.unitname ? "#4299e1" : "#f1f1f1"}
                textColor={text === value.unitname ? "white" : "black"}
                onClick={() => selectOption({asset_id:value.asset_id, decimal:value.decimal, unitname:value.unitname, rate:value.rate})}
                pl={2}
                pr={2}>
                <Box p='1'>
                  <HStack>
                  <Image boxSize='25px' objectFit='cover' borderRadius='lg' alt={value.unitname} src={'currencies/'+value.asset_id+'.png'} />
                  <Text
                    fontStyle={"revert"}
                    fontWeight={"hairline"}
                    _hover={{ fontWeight: "normal" }}
                  >
                    {value.unitname}
                  </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Box p='0'>
                  <VStack>
                    <Text fontSize='xs' color={'gray.300'}>BALANCE</Text> 
                    <Text fontSize='xs' mt={0}>{(value.balance / Math.pow(10, value.decimal)).toLocaleString()}</Text> 
                  </VStack>
                </Box>
              </Flex>
            ))}
          </Box>
        </PopoverContent>
      </Popover>
    </Box>
  );
}

export default TokenDropdown;
