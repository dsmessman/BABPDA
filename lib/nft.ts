import { Wallet } from '../lib/algorand-session-wallet'
import { getMetaFromIpfs, getArc69MetaFromIpfs, getMimeTypeFromIpfs, getArc69MetaFromHash } from './ipfs'
import { decodeAddress, assignGroupID, Transaction } from 'algosdk'
import { sendWait, getSuggested } from './algorand'
import { get_asa_create_txn, get_asa_xfer_txn, get_pay_txn, get_asa_optin_txn, get_asa_destroy_txn} from './transactions'
import { platform_settings as ps } from './platform-conf'
import { showErrorToaster } from '../src/Toaster'
import { Metadata } from './metadata'
import { sha256 } from 'js-sha256'
import { CID } from 'multiformats/cid'
import * as mfsha2 from 'multiformats/hashes/sha2'
import * as digest from 'multiformats/hashes/digest'
import { CIDVersion } from 'multiformats/types/src/cid'

export const ARC3_NAME_SUFFIX = "@arc3"
export const ARC3_URL_SUFFIX = "#arc3"
export const ARC69_NAME_SUFFIX = "@arc69"
export const ARC69_URL_SUFFIX = "#arc69"
export const METADATA_FILE = "metadata.json"
export const JSON_TYPE = "application/json"

export const asaURL = (cid) => ipfsURL(cid) + ARC3_URL_SUFFIX
export const asaArc69URL = (cid) => ipfsURL(cid) + ARC69_URL_SUFFIX
export const ipfsURL = (cid) => `ipfs://${cid}`
export const fileURL = (cid, name) => `${ps.ipfs.ipfsGateway + cid}/${name}`

export function resolveProtocol(url: string, reserveAddr: string): string {
  if (url.endsWith(ARC3_URL_SUFFIX))
    url = url.slice(0, url.length - ARC3_URL_SUFFIX.length)
  if (url.endsWith(ARC69_URL_SUFFIX))
    url = url.slice(0, url.length - ARC69_URL_SUFFIX.length)
  const chunks = url.split("://")
    // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be
    if (chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
        // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
        chunks[0] = 'ipfs'
        const cidComponents = chunks[1].split(':')
        if (cidComponents.length !== 5) {
            // give up
            console.log('unknown ipfscid format')
            return url
        }
        const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents

        // const cidVersionInt = parseInt(cidVersion) as CIDVersion
        if (cidHash.split('}')[0] !== 'sha2-256') {
            console.log('unsupported hash:', cidHash)
            return url
        }
        if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
            console.log('unsupported codec:', cidCodec)
            return url
        }
        if (asaField !== 'reserve') {
            console.log('unsupported asa field:', asaField)
            return url
        }
        let cidCodecCode
        if (cidCodec === 'raw') {
            cidCodecCode = 0x55
        } else if (cidCodec === 'dag-pb') {
            cidCodecCode = 0x70
        }

        // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
        const addr = decodeAddress(reserveAddr)
        const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey)

        const cid = CID.create(parseInt(cidVersion) as CIDVersion, cidCodecCode, mhdigest)
        //console.log('switching to id:', cid.toString())
        chunks[1] = cid.toString() + '/' + chunks[1].split('/').slice(1).join('/')
        //console.log('redirecting to ipfs:', chunks[1])
    }
  // No protocol specified, give up
  if (chunks.length < 2) return url

  // Switch on the protocol
  switch (chunks[0]) {
    case "ipfs": // Its ipfs, use the configured gateway
      return ps.ipfs.ipfsGateway + chunks[1]
    case "https": // Its already http, just return it
      return url
    default:
      return null
    // TODO: Future options may include arweave or algorand
  }
}

export class Token {
    id: number

    name: string
    unitName: string
    url: string

    metadataHash: string

    total: number
    decimals: number

    creator: string

    manager: string
    reserve: string
    clawback: string
    freeze: string

    defaultFrozen: boolean

    constructor (t: any) {
        this.id = t.id || 0
        this.name = t.name || ''
        this.unitName = t.unitName || ''
        this.url = t.url || ''

        this.metadataHash = t.metadataHash || ''

        this.total = t.total || 0
        this.decimals = t.decimals || 0

        this.creator = t.creator || ''

        this.manager = t.manager || ''
        this.reserve = t.reserve || ''
        this.clawback = t.clawback || ''
        this.freeze = t.freeze || ''

        this.defaultFrozen = t.defaultFrozen || false
    }

    static fromParams (t: any): Token {
        const p = t.params
        return new Token({
            id: t.index,
            name: p.name || '',
            unitName: p['unit-name'] || '',
            url: p.url || '',
            metadataHash: p['metadata-hash'] || '',
            total: p.total || 0,
            decimals: p.decimals || 0,
            creator: p.creator || '',
            manager: p.manager || '',
            reserve: p.reserve || '',
            clawback: p.clawback || '',
            freeze: p.freeze || '',
            defaultFrozen: p['default-frozen'] || false,
        }) as Token

    }

    valid (): boolean {
        return this.id > 0 && this.total > 0 && this.url !== ''
    }

}

export class NFT {
    asset_id: number // ASA idx in algorand
    collection_id: number // ASA collection_id in dApp
    amount: number // ASA idx in algorand
    manager: string  // Current manager of the token representing this NFT
    reserve: string  // Current manager of the token representing this NFT
    url: string      // URL of metadata json
    verified: boolean // IF the nft for this wallet was verified or not
    alltokenrewards: any // Total paid rewards per nft / per token
    metadata: any
    transactions: Transactions

    constructor(metadata: any, 
        transactions: any,
        asset_id?: number, 
        collection_id?: number, 
        amount?: number,
        manager?: string, 
        reserve?: string, 
        verified?: boolean, 
        alltokenrewards?: any) 
    {
        this.metadata = metadata
        this.transactions = transactions
        this.asset_id = asset_id
        this.collection_id = collection_id
        this.amount = amount
        this.manager = manager
        this.reserve = reserve
        this.verified = verified
        this.alltokenrewards = alltokenrewards
    }

    async verifyToken(wallet: Wallet, assetIsOptedIn: any) {
        
        if(assetIsOptedIn.length === 0) {

            const suggestedParams = await getSuggested(10)
            const buyer = await wallet.getDefaultAccount()
            var string = "verify transaction"
            var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
            //JUST SENDING A 0.00 DOLLAR TRANSACTION
            const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.admin_addr, 0, uint8))
    
            const grouped = [
                /* asa_opt_txn, asa_opt_txn1, */ purchase_amt_txn
            ]
    
            assignGroupID(grouped)
    
            const [/*s_asa_opt_txn,*/  s_purchase_amt_txn, /*asa_xfer*/, /*price_xfer*/, /*asa_cfg*/ , /* tag_txns */, /*algo_close*/] = await wallet.signTxn(grouped)
    
            const combined = [
                /*s_asa_opt_txn, */ s_purchase_amt_txn
            ]
    
            //return await sendWait(combined) !== undefined   
            const data = await sendWait(combined).then((txid) => {
                return txid
            }).catch((err)=>{ 
                console.log("error", err)
            })
            return data

        } else {
            
            const remainingAssets = assetIsOptedIn.filter(asset => asset.optin === true)
            //console.log("remainingAssets", remainingAssets)
            var string2 = "Opted Into Asset"
            var uint82 = Uint8Array.from(string2.split("").map(x => x.charCodeAt(0)))
            const suggestedParams = await getSuggested(10)
            const buyer = await wallet.getDefaultAccount()
            const asa_opt_txn = new Transaction(get_asa_optin_txn(suggestedParams, buyer, (remainingAssets[0]?.asset_id === 1056720965)? 1056720965 : (remainingAssets[0]?.asset_id === 612770026)? 612770026 : 1056720965, uint82))
            //JUST SENDING A 0.00 DOLLAR TRANSACTION
            var string = "verify transaction"
            var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
            const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.admin_addr, 0, uint8))
    
            const grouped = [
                asa_opt_txn, purchase_amt_txn
            ]
    
            assignGroupID(grouped)
    
            const [s_asa_opt_txn, s_purchase_amt_txn, /*asa_xfer*/, /*price_xfer*/, /*asa_cfg*/ , /* tag_txns */, /*algo_close*/] = await wallet.signTxn(grouped)
    
            const combined = [
                s_asa_opt_txn, s_purchase_amt_txn
            ]
    
            //return await sendWait(combined) !== undefined   
            const data = await sendWait(combined).then((txid) => {
                return txid
            }).catch((err)=>{ 
                console.log("error", err)
            })
            return data
        }
    }

    imgSrc(): string {
        if (this.metadata.image !== undefined && this.metadata.image != "")
            return NFT.resolveUrl(this.metadata.image)

        return "https://via.placeholder.com/500"
    }

    explorerSrc(): string {
        const net = ps.algod.network == "mainnet" ? "" : ps.algod.network + "."
        return "https://" + net + ps.explorer + "/asset/" + this.asset_id
    }

    static arc3AssetName(name: string): string {
        if(name.length>27){
            name = name.slice(0,27)
        }
        return name + "@arc3"
    }
    
    static arc69AssetName(name: string): string {
        if(name.length>27){
            name = name.slice(0,27)
        }
        return name + "@arc69"
    }

    static resolveUrl(url: string): string {
        const [protocol, uri] = url.split("://")
        switch(protocol){
            case "ipfs":
                return ps.ipfs.ipfsGateway + uri
            case "algorand":
                //TODO: create url to request note field?
                showErrorToaster("No url resolver for algorand protocol string yet")
                return 
            case "http":
                return url
            case "https":
                return url
        }

        showErrorToaster("Unknown protocol: " + protocol) 
        return  ""
    }

    static async fromToken(token: any): Promise<NFT> {
        if (token === undefined) return undefined;
        //let checkUrlExt = token.params.url.split(/[#?]/)[0].split('.').pop().trim()
        //if (checkUrlExt!=='json') return undefined;
        
        const url = resolveProtocol(token.params.url, token.params.reserve)
        // TODO: provide getters for other storage options
        // arweave? note field?

        const urlMimeType = await getMimeTypeFromIpfs(url)
        //console.log("tokentoken",token)

        // eslint-disable-next-line default-case
        switch (urlMimeType) {
            case JSON_TYPE:
            if (token.params.url.endsWith(ARC69_URL_SUFFIX)) {
                return new NFT(await getArc69MetaFromIpfs(url), 
                token.transactions, 
                token.index, 
                token.collection_id,
                token.amount, 
                token.params.creator,
                token.params.reserve,  
                token.validatedStaking, 
                token.alltokenrewards)
            } else if(token.params.url.endsWith(ARC3_URL_SUFFIX)) {
                return new NFT(await getMetaFromIpfs(url), 
                token.transactions, 
                token.index, 
                token.collection_id,
                token.amount, 
                token.params.creator, 
                token.params.reserve, 
                token.validatedStaking,
                token.alltokenrewards)
                //return new NFT(await getNFTFromMetadata(token.params.url), token.index, token['params']['manager'])
            } else {
                console.log("fromTokenfromToken-urlMimeType",token)
            }
        }

        if (token.params.url.endsWith(ARC69_URL_SUFFIX)) {
            //return new NFT(ARC69Metadata.fromToken(token), token, urlMimeType)
            return new NFT(await getArc69MetaFromIpfs(url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.creator, 
            token.params.reserve,  
            token.validatedStaking, 
            token.alltokenrewards)
        } else if(token.params.url.endsWith(ARC3_URL_SUFFIX)) {
            return new NFT(await getMetaFromIpfs(url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.creator, 
            token.params.reserve,  
            token.validatedStaking, 
            token.alltokenrewards)
        } else {
            //console.log("fromTokenfromToken",token)
            return new NFT(await getArc69MetaFromHash(token.note, token.params['unit-name'], token.params.url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.creator, 
            token.params.reserve,  
            token.validatedStaking, 
            token.alltokenrewards)
        }
    }

    static emptyNFT(): NFT {
        return new NFT(emptyMetadata(), emptyTransactionsdata())
    }
}


export type Transactions = {
    id: string
    amountpaid: number
    asset_id: number
    tokenname: string
    tokenunit: string
    txid: string
    createdat: string
}

export function emptyTransactionsdata(): Transactions {
    return {
        id: "",
        amountpaid: 0,
        asset_id: 0,
        tokenname: "",
        tokenunit: "",
        txid: "",
        createdat: "",
    };
}

export type NFTMetadata = {
    name: string
    description: string
    image: string
    mime_type: string
    unitName: string
    reserve: string
    properties: {
        file: {
            name: string
            type: string
            size: number
        }
        artist: string
        trait_type: string
    }
}

export type ARC69Metadata = {
    standard: string
    description: string
    image: string
    total: number
    unitName: string
    reserve: string
    royalty: number
    image_integrity: string
    image_mimetype: string
    properties: {
        file: {
            name: string
            type: string
            size: number
        }
        artist: string
        trait_type: string
    }
}

export function mdhash(md: NFTMetadata): Uint8Array {
    const hash = sha256.create();
    hash.update(JSON.stringify(md));
    return new Uint8Array(hash.digest())
}

export function emptyMetadata(): NFTMetadata {
    return {
        name: "",
        description: "",
        image: "",
        mime_type: "",
        unitName: "",
        reserve: "",
        properties: {
            file: {
                name: "",
                type: "",
                size: 0,
            },
            artist: "",
            trait_type: "",
        }
    };
}
export function emptyARC69Metadata(): ARC69Metadata {
    return {
        standard: "",
        description: "",
        image: "",
        total: 0,
        unitName:  "",
        reserve: "",
        royalty: 0,
        image_integrity:  "",
        image_mimetype:  "",
        properties: {
            file: {
                name: "",
                type: "",
                size: 0,
            },
            artist: "",
            trait_type: "",
        }
    };
}