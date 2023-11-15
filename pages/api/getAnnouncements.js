import nextConnect from 'next-connect'
import GET_ANNOUNCEMENTS from "../../queries/getAnnouncements"
import GET_ANNOUNCEMENTS_FILTER_CATEGORY from "../../queries/getAnnouncementsFilterCategory"
import GET_ANNOUNCEMENTS_FILTER_PROJECT from "../../queries/getAnnouncementsFilterProject"
import GET_ANNOUNCEMENTS_FILTER_MULTI from "../../queries/getAnnouncementsFilterMulti"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //let address = getCookie('cw', { req, res })
    //console.log("get data", data)
    await client.mutate({
        mutation: (data?.projectfilter !=='' && data?.categoryfilter !=='')? GET_ANNOUNCEMENTS_FILTER_MULTI : (data?.projectfilter ==='' && data?.categoryfilter ==='')? GET_ANNOUNCEMENTS : (data?.projectfilter !=='' && data?.categoryfilter ==='')? GET_ANNOUNCEMENTS_FILTER_PROJECT : GET_ANNOUNCEMENTS_FILTER_CATEGORY,
        variables: { first: data.first, offset: data.offset, categoryfilter: data?.categoryfilter, projectfilter: data?.projectfilter } // data.first data.offset 
    }).then((senddata) => {
        //console.log("get data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        console.log("error getting data", err)
    }) 
}) 

export default handler


 