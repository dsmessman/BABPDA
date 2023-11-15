import nextConnect from 'next-connect'
import GET_CATEGORIES from "../../queries/getCategories"
import client from "../../lib/apollo"
import { getCookie } from 'cookies-next'
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //let address = getCookie('cw', { req, res })
    //console.log("get data", data)
    await client.mutate({
        mutation: GET_CATEGORIES,
        variables: { first: data.first, offset: data.offset } // data.first data.offset 
    }).then((senddata) => {
        //console.log("get data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        console.log("error getting data", err)
    }) 
}) 

export default handler