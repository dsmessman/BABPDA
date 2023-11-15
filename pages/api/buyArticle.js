import nextConnect from 'next-connect'
import { INSERT_UPDATE_ARTICLE } from "../../queries/insertUpdateArticle"
import client from "../../lib/apollo"
import { sendWaitApi } from '../../lib/algorand'
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("data", data)
    if(data) {
        const decodedJsonObject = Buffer.from(data.txBlob, 'base64'); 
        const combined = Object.values(JSON.parse(decodedJsonObject))
        //console.log("combined", combined)
        const signedTxID = await sendWaitApi(combined, data.seller_wallet).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
            res.json({success: false, txid: '', message: 'error purchasing'})
        })
        //console.log("signedTxID", signedTxID)
        if(signedTxID) {
            await client.mutate({
                mutation: INSERT_UPDATE_ARTICLE,
                variables: { articles: { articleid: data.articleid,
                    wallet: {address: data.address},
                    articletransactions: [{
                        amountpaid: data.articletransactions[0].amountpaid, 
                        tokenunit: data.articletransactions[0].tokenunit, 
                        receiver: data.articletransactions[0].receiver, 
                        receiver_nfd: data.articletransactions[0].receiver_nfd,
                        article_id: data.articletransactions[0].article_id, 
                        createdat: data.articletransactions[0].createdat,
                        txid: signedTxID
                    }]}},
            }).then((senddata) => {
                //console.log("content purchased", senddata)
                res.json({success: true, txid: signedTxID, message: 'content purchased'})
            }).catch((err)=>{ 
                //console.log("error purchasing", err)
                //console.log("error purchasing article", err.graphQLErrors)
                res.json({success: false, txid: '', message: 'error submitting your purchase'})
            }) 
        } else {
            res.json({success: false, txid: '', message: 'error content purchase not successful'})
        }
    } else {
        res.json({success: false, txid: '', message: 'error'})
    }
}) 

export default handler