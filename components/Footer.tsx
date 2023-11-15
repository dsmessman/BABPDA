import Link from 'next/link'
import * as React from 'react'
import {
    Box,
    Center,
  } from '@chakra-ui/react';
  import { useEffect, useState } from "react"
  import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon, InfoIcon } from '@chakra-ui/icons';
  import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'

  export default function Footer() {
      
    return (
      <Center>
      &copy; 2023 press.algo L.L.C - All Rights Reserved.
      </Center>
    )
}
