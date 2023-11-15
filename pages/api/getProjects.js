import nextConnect from 'next-connect'
import GET_PROJECTS from "../../queries/getProjects"
import GET_PROJECTS_FILTER from "../../queries/getProjectsFilter"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("get data", data)
    await client.mutate({
        mutation: (data?.creator && data?.creator !=='')? GET_PROJECTS_FILTER : GET_PROJECTS,
        variables: { first: data?.first, offset: data?.offset, creator: data?.creator } // data.first data.offset 
    }).then((senddata) => {
        //console.log("get data", senddata.data.queryProjects)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        console.log("error getting data", err)
    }) 
}) 

export default handler