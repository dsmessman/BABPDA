import { Wallet } from '../lib/algorand-session-wallet'
import { decodeAddress, assignGroupID, Transaction } from 'algosdk'
import { sendWait, getSuggested } from './algorand'
import { get_asa_create_txn, get_asa_optin_txn, get_asa_xfer_txn, get_pay_txn, get_asa_destroy_txn} from './transactions'
import { platform_settings as ps } from './platform-conf'
import { showErrorToaster } from '../src/Toaster'

export class WEB3 {
    createdat: string // date content was created
    id: number  // id of the content
    name: string  // content Name
    image: string  // content Image
    mimetype: string  // content Image
    url: string      // URL of metadata json
    cost: number // cost of content
    transactions: Transactions
    articletransactionsByWallet: any
    articleviews: any
    seller_wallet: string
    seller_wallet_nfd: string
    twitter: string  // content creator twitter
    marketplace: string  // content creator
    website: string // URL of metadata json

    constructor(transactions: any,
        articletransactionsByWallet?: any,
        articleviews?: any,
        createdat?: string, 
        id?: number, 
        name?: string, 
        image?: string, 
        mimetype?: string, 
        cost?: number,
        seller_wallet?: string,
        seller_wallet_nfd?: string,
        twitter?: string, 
        marketplace?: string, 
        website?: string) 
    {
        this.transactions = transactions
        this.articletransactionsByWallet = articletransactionsByWallet
        this.articleviews = articleviews
        this.createdat = createdat
        this.id = id
        this.name = name
        this.image = image
        this.mimetype = mimetype
        this.cost = cost
        this.seller_wallet = seller_wallet
        this.seller_wallet_nfd = seller_wallet_nfd
        this.twitter = twitter
        this.marketplace = marketplace
        this.website = website
    }

    static async createArticle(wallet: Wallet, currency: any): Promise<any> {
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        var string = `press.algo one time listing fee`
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        
        let txns: Transaction[] = [];
        if(currency.asset_id === 0) {
            const totalCost = (1 * 1000000)
            const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.listing_fee_addr, totalCost, uint8))
            const [s_purchase_amt_txn] = await wallet.signTxn([purchase_amt_txn])
            const combined = [s_purchase_amt_txn]
            return combined
        } else {
            const rateCost = 1 / currency.rate
            const totalCost = (rateCost * Math.pow(10, currency.decimal))
            const purchase_amt_txn = new Transaction(get_asa_xfer_txn(suggestedParams, buyer, ps.application.listing_fee_addr, currency.asset_id, parseInt(totalCost.toFixed()), uint8))
            const [s_purchase_amt_txn] = await wallet.signTxn([purchase_amt_txn])
            const combined = [s_purchase_amt_txn]
            return combined
        }
    }

    static async buyArticle(wallet: Wallet, id: any, ticketcost: any, seller_wallet: any, currency: any): Promise<any> {
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        var string = `press.algo purchase for articleid=${id}`
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        var string1 = `press.algo fee for content purchase for articleid=${id}`
        var uint81 = Uint8Array.from(string1.split("").map(x => x.charCodeAt(0)))
        
        let txns: Transaction[] = [];
        if(currency.asset_id === 0) {
            const totalCost = (ticketcost * 1000000)
            const totalFee = totalCost * 0.1
            const totalFinalCost = totalCost - totalFee
            const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, seller_wallet, totalFinalCost, uint8))
            const purchase_amt_txn1 = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.fee_addr, totalFee, uint81))
            const grouped = [
                purchase_amt_txn, purchase_amt_txn1
            ]
            assignGroupID(grouped)
            const signedTxns = await wallet.signTxn(grouped)
            return signedTxns
        } else {
            const rateCost = ticketcost / currency.rate
            const totalCost = (rateCost * Math.pow(10, currency.decimal))
            const totalFee = totalCost * 0.1
            const totalFinalCost = totalCost - totalFee
            //console.log("totalFee: ", totalFee);
            //console.log("totalFinalCost: ", totalFinalCost);
            const purchase_amt_txn = new Transaction(get_asa_xfer_txn(suggestedParams, buyer, seller_wallet, currency.asset_id, parseInt(totalFinalCost.toFixed()), uint8))
            const purchase_amt_txn1 = new Transaction(get_asa_xfer_txn(suggestedParams, buyer, ps.application.fee_addr, currency.asset_id, parseInt(totalFee.toFixed()), uint81))
            const grouped = [
                purchase_amt_txn, purchase_amt_txn1
            ]
            assignGroupID(grouped)
            const signedTxns = await wallet.signTxn(grouped)
            return signedTxns
        }
    }
    imgSrc(): string {
        if (this.image !== undefined && this.image != "")
            return WEB3.resolveUrl(this.image)

        return "https://via.placeholder.com/500"
    }

    static resolveUrl(url: string): string {
        const [protocol, uri] = url.split("://")
        //console.log("uri: ", uri)
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
                return (uri.includes("ipfs.algonode.xyz/ipfs"))? url.replace("#i", "") + '?optimizer=image&width=350&quality=70' : url
        }

        showErrorToaster("Unknown protocol: " + protocol) 
        return  ""
    }
    static emptyWEB3(): WEB3 {
        return new WEB3(emptyTransactionsdata())
    }
}

export type Transactions = {
    id: string
    txid: string
    createdat: string
    amountpaid: number
    tokenunit: string
    receiver: string
}

export function emptyTransactionsdata(): Transactions {
    return {
        id: "",
        txid: "",
        createdat: "",
        amountpaid: 0,
        tokenunit: "",
        receiver: "",
    };
}
