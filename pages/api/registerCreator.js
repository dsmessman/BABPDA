import nextConnect from 'next-connect'
import { INSERT_NEW_CREATOR } from "../../queries/insertNewCreator"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("register data", data)
    await client.mutate({
        mutation: INSERT_NEW_CREATOR,
        variables: {  creator: { 
            name: data.name,
            creator: data.creator,
            isactive: true,
            createdat: data.createdat,
            image: (data.profileimage)? data.profileimage: null, 
            twitter: (data.twitter)? data.twitter: null,
            discord: (data.discord)? data.discord: null,
        }},
    }).then((senddata) => {
        //console.log("registered creator wallet successfully", senddata)
        res.json({success: true, message: 'registered creator wallet successfully'})
    }).catch((err)=>{ 
        console.log("error registering creator wallet", err)
        res.json({success: false, message: 'error registering creator wallet'})
    }) 
}) 

export default handler