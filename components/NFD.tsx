import React from "react"
import useSWR from "swr"
import { Flex, Select, Button } from '@chakra-ui/react'
import { setCookies } from 'cookies-next'
import { NotAllowedIcon } from '@chakra-ui/icons'

type NFDProps = {
    sessionWallet: any
    handleChangeAccount: any
    disconnectWallet: any
    defaultAddress: any
    accountlist: any
    defaultValue: any
}

const fetcher = (url: string) => fetch(url).then((res) => (res.status === 404)? [] : res.json())

export default function NFD(props: NFDProps) {

  const { data, error } = useSWR(
    "https://api.nf.domains/nfd/address?address=" + props.accountlist.join('&address='),
    fetcher
  )
  function getNFD(addressToSearch) {
    var nfdwallet = data.filter(item => {
      return item.caAlgo[0] === addressToSearch
    })
    return nfdwallet
  }
  if (error) return props.defaultAddress
  if (!data) return <option>Loading...</option>
  if (document && data) {
    //var cwnfd = document.getElementById("nfd") //not type script compatible
    var cwnfd = (document.getElementById("nfd")) as HTMLSelectElement;
    if(cwnfd?.selectedOptions[0]?.innerText.includes('.algo')) {
      setCookies('cw_nfd', cwnfd?.selectedOptions[0]?.innerText)
    } else {
      setCookies('cw_nfd', null)
    } 
  }
  const onSelectChange = async (e) => {
    var cwnfd = e.target.selectedOptions[0]?.innerText
    //console.log("onSelectChange", cwnfd)
    if(cwnfd.includes('.algo')) {
      setCookies('cw_nfd', cwnfd)
    } else {
      setCookies('cw_nfd', null)
    }
    props.handleChangeAccount(e)
  }

  return (
    <>
    <Flex w={'100%'}>
     <Select 
        fontFamily='Atkinson Hyperlegible' fontSize='xs'
        ml={1} 
        mr={1} 
        id={'nfd'}
        onChange={(e) => onSelectChange(e)} 
        defaultValue={props.sessionWallet.accountIndex()} >
        {props.accountlist.map((addr, idx) => (
        <option value={idx} key={idx}>{(getNFD(addr).length > 0)? getNFD(addr)[0].name : addr.substring(0, 5) + '...' + addr.slice(-4)}</option>
      ))}
    </Select>
    <Button mr={1} onClick={props.disconnectWallet}><NotAllowedIcon/></Button>
  </Flex>
  </>
  )
}
