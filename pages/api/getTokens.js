import nextConnect from 'next-connect'
import GET_ALL_TOKENS from "../../queries/getAllTokens"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.get(async (req, res) => {
    await client.mutate({
        mutation: GET_ALL_TOKENS
    }).then((senddata) => {
        //console.log("get live tokens data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        console.log("error getting live tokens data", err)
    }) 
    //res.json(data)
}) 

export default handler