import nextConnect from 'next-connect'
import { INSERT_NEW_ARTICLE } from "../../queries/insertNewArticle"
import client from "../../lib/apollo"
import { sendWaitApi } from '../../lib/algorand'
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("article data", data)
    /*
    addCategories(input: {
        name: "Testnet Update", 
        projects: {name: "ALVATARS"}, 
        announcements: {projectname: "ALVATARS", 
        content: "ALVATARS Giveaways", 
        createdat: "2023-04-18T00:26:08.966Z"}, sortorder: 2}, upsert: true) {
        numUids
      }
    */
   /*
    variables: {  article: { 
        name: data.name,
        projects: {name: data.projectname },
        announcements: {
            projectname: data.projectname, 
            content: data.content, 
            cost: data.cost, 
            serller_wallet: data.serller_wallet, 
            contentpreview: (data.contentpreview)? data.contentpreview: null, 
            image: (data.contentimage)? data.contentimage: null, 
            mimetype: null, //add for video/mp4 support
            createdat: data.createdat 
        },
    }}
    */
    if(data) {
        const decodedJsonObject = Buffer.from(data.txBlob, 'base64'); 
        const combined = Object.values(JSON.parse(decodedJsonObject))
        //console.log("combined", combined)
        const signedTxID = await sendWaitApi(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
            res.json({success: false, txid: '', message: 'error creating article'})
        })
        //console.log("signedTxID", signedTxID)
        if(signedTxID) {
            await client.mutate({
                mutation: INSERT_NEW_ARTICLE,
                variables: { 
                    name: data.name,
                    projectname: data.projectname,
                    content: data.content, 
                    contentpreview: (data.contentpreview)? data.contentpreview: null, 
                    image: data.image,
                    mimetype: data.mimetype,
                    cost: data.cost,
                    createdat: data.createdat,
                    seller_wallet: data.seller_wallet
                },
            }).then((senddata) => {
                //console.log("article created", senddata)
                res.json({success: true, message: 'article created'})
            }).catch((err)=>{ 
                console.log("error creating article", err)
                res.json({success: false, message: 'error creating article'})
            }) 
        } else {
            res.json({success: false, txid: '', message: 'error content purchase not successful'})
        }
    } else {
        res.json({success: false, txid: '', message: 'error'})
    }
}) 

export default handler