import nextConnect from 'next-connect'
import { UPDATE_PORTFOLIO } from "../../queries/updatePortfolio"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    await client.mutate({
        mutation: UPDATE_PORTFOLIO,
        variables: { wallet: { address: data.address,
            selectedProjects: data.selectedProjects}, address: data.address, type: data.type},
    }).then((senddata) => {
        //console.log("wallet portfolio successfully updated", senddata)
        res.json({success: true, message: 'wallet portfolio successfully updated'})
    }).catch((err)=>{ 
        //console.log("error updating wallet portfolio", err)
        res.json({success: false, message: 'error updating wallet portfolio'})
    }) 
}) 

export default handler