import React, { useContext, useEffect, useState } from "react"
import { SessionWallet, PermissionResult, SignedTxn, Wallet } from '../../lib/algorand-session-wallet'
import { getWalletAssetData } from '../../lib/algorand'
import { platform_settings as ps } from '../../lib/platform-conf'
import { RequestPopupProps, RequestPopup, PopupPermission, DefaultPopupProps } from '../RequestPopup'

const PAGE_SIZE=4;

export interface FraktionContextType {
  defaultWallet: string;
  sessionWallet: Wallet;
  updateWallet: Function;
  handleFetchAnnouncements: Function;
  announcements: any;
  connected: Promise<boolean>;
  loading: boolean;
  tokenList: any;
  algoBalance: any;
  walletAssets: any;
  currency: any;
  setCurrency: any;
  fetchNextPage: any;
  pageFilter: any;
  setPageFilter: any;
  categoryFilter: any;
  setCategoryFilter: any;
  hasNextPage: boolean;
  popupProps: typeof DefaultPopupProps;
}

export const NavigtionContext = React.createContext<FraktionContextType>({
  //@ts-ignore
  sessionWallet: () => {},
  //@ts-ignore
  updateWallet: () => {},
  //@ts-ignore
  handleFetchAnnouncements: () => {},
  //@ts-ignore
  tokenList: () => {},
  //@ts-ignore
  algoBalance: () => {},
  //@ts-ignore
  walletAssets: () => {},
  //@ts-ignore
  announcements: () => {},
  //@ts-ignore
  currency: () => {},
  //@ts-ignore
  setCurrency: () => {},
  //@ts-ignore
  fetchNextPage: () => {},
  //@ts-ignore
  pageFilter: () => {},
  //@ts-ignore
  setPageFilter: () => {},
  //@ts-ignore
  categoryFilter: () => {},
  //@ts-ignore
  setCategoryFilter: () => {},
  //@ts-ignore
  hasNextPage: true,
  //@ts-ignore
  connected: async (): Promise<boolean> => { return false; },
  //@ts-ignore
  loading: false,
});

export const NavigtionProvider = ({
  children = null,
}: {
  children: JSX.Element | null;
}): JSX.Element => {
  
  const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));
  const popupCallback = {
    async request(pr: PermissionResult): Promise<SignedTxn[]> {
      let result = PopupPermission.Undecided;
      setPopupProps({isOpen:true, handleOption: (res: PopupPermission)=>{ result = res} })		
      
      async function wait(): Promise<SignedTxn[]> {
        while(result === PopupPermission.Undecided) await timeout(50);

        if(result == PopupPermission.Proceed) return pr.approved()
        return pr.declined()
      }

      //get signed
      const txns = await wait()

      //close popup
      setPopupProps(DefaultPopupProps)

      //return signed
      return txns
    }
  }
  const sw = new SessionWallet(ps.algod.network, popupCallback)
  const [sessionWallet, setSessionWallet] =  useState<any>(sw)
  //@ts-ignore
  const [loading, setLoading] = React.useState(false)
  const [pageFilter, setPageFilter] = React.useState(undefined)
  const [categoryFilter, setCategoryFilter] = React.useState(undefined)
  const [popupProps, setPopupProps] = useState<any>(DefaultPopupProps)
  const [walletAssets, setWalletAssets] = React.useState([])
  const [tokenList, setTokenList] = React.useState([])
  const [algoBalance, setAlgoBalance] = React.useState()
  const [connected, setConnected] = useState<Promise<boolean>>(sw.connected())
  const [currency, setCurrency] = React.useState({asset_id:0, decimal: 6, unitname:"ALGO", rate:"1"})
  const updateWallet = async (sw: SessionWallet) => {
    setSessionWallet(sw)
    setConnected(sw.connected())
    
    const defaultAccount = await sw.getDefaultAccount()
    setDefaultWallet(defaultAccount)
    const response = await fetch('/api/getPortfolio', {
        method: 'POST',
        body: JSON.stringify({address: defaultAccount})
    })
    const data = await response.json()
    if(data.data.queryWallet?.length > 0) {
      const allSelectedProjects = data.data.queryWallet[0]?.selectedProjects.filter((p) => p.type === "project").map(p => p.name)
      const allSelectedCategories = data.data.queryWallet[0]?.selectedProjects.filter((c) => c.type === "category").map(c => c.name)
      setPageFilter(allSelectedProjects.join()); // update the state
      setCategoryFilter(allSelectedCategories.join()); // update the state
    } else {
      setPageFilter(undefined)
      setCategoryFilter(undefined)
    }
  };

  const [defaultWallet, setDefaultWallet] = React.useState('')
  const [announcements, setAnnouncements] = React.useState([])
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(true)
  let [page, setPage] = useState<number>(0)

  const fetchNextPage = async () => {
    let nextpage = page + 1
    let offset = (nextpage===1)? 0 : PAGE_SIZE * (page)

    const apiResponse = await fetch('/api/getAnnouncements', {
        method: 'POST',
        body: JSON.stringify({first: PAGE_SIZE, offset: offset, categoryfilter: (categoryFilter !== undefined)? categoryFilter : "", projectfilter: (pageFilter !== undefined)? pageFilter : ""})
    })
    const apiData = await apiResponse.json()
    page = page == 0 ? 1 : page + 1

    if(PAGE_SIZE > apiData.data.queryCategories.length){
      setHasNextPage(false)
    }
    setPage(page)
    setAnnouncements([...announcements, ...apiData.data.queryCategories])
  }

  const handleFetchAnnouncements = async () => {
    const apiResponse = await fetch('/api/getAnnouncements', {
        method: 'POST',
        body: JSON.stringify({first: PAGE_SIZE, offset: 0, categoryfilter: (categoryFilter !== undefined)? categoryFilter : "", projectfilter: (pageFilter !== undefined)? pageFilter : ""})
    })
    const apiData = await apiResponse.json()
    setPage(1)
    setHasNextPage(true)
    setAnnouncements(apiData.data.queryCategories)
    if(connected) {
      const tokensResponse = await fetch("/api/getTokens")
      const tokensData = await tokensResponse.json()
      const getDefaultAccount = await sessionWallet.getDefaultAccount()
      //console.log("defaultWallet", defaultWallet)
      await getWalletAssetData(getDefaultAccount, tokensData.data.queryTokens).then((assetData)=> { 
          //console.log("getWalletAssetData", assetData)
          if(assetData) {
            setWalletAssets(assetData.walletassets)
            setTokenList(assetData.tokenBal)
            setAlgoBalance(assetData.algoBalance)
          }
      }).catch((err)=>{ 
          console.log("error getWalletAssetData",err)
      }) 
      setLoading(true)
    } else {
      setLoading(true)
    }
    setLoading(true)
  }

  useEffect(()=> {
    handleFetchAnnouncements()
    if(!connected) return
      updateWallet(sw);
  },[connected])

  useEffect(()=> {
    handleFetchAnnouncements()
  },[pageFilter, categoryFilter])
  //@ts-ignore

  return (
    <NavigtionContext.Provider
      value={{
        defaultWallet,
        sessionWallet,
        updateWallet,
        handleFetchAnnouncements,
        tokenList,
        algoBalance,
        walletAssets,
        announcements,
        currency,
        setCurrency,
        fetchNextPage,
        pageFilter,
        setPageFilter,
        categoryFilter,
        setCategoryFilter,
        hasNextPage,
        //@ts-ignore
        connected,
        loading,
        popupProps
      }}
    >
      {children}
    </NavigtionContext.Provider>
  );
};

export const useNavigation = () => {
  const {
    defaultWallet,
    sessionWallet,
    updateWallet,
    handleFetchAnnouncements,
    tokenList,
    algoBalance,
    walletAssets,
    announcements,
    currency,
    setCurrency,
    fetchNextPage,
    pageFilter,
    setPageFilter,
    categoryFilter,
    setCategoryFilter,
    hasNextPage,
    connected,
    loading,
    popupProps
  } = useContext(NavigtionContext);
  return {
    defaultWallet,
    sessionWallet,
    updateWallet,
    handleFetchAnnouncements,
    tokenList,
    algoBalance,
    walletAssets,
    announcements,
    currency,
    setCurrency,
    fetchNextPage,
    pageFilter,
    setPageFilter,
    categoryFilter,
    setCategoryFilter,
    hasNextPage,
    connected,
    loading,
    popupProps
  };
};
