const getAccessToken = require('./getAccessToken.js')
const rp = require('request-promise')
const fs=require('fs')

const CloudStorage ={
    async download(ctx,fileList){
        const ACCESS_TOKEN=await getAccessToken()
        const options={
            method:'post',
            uri:`https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
            body:{
                env:ctx.state.env,
                file_list:fileList
            },
            json: true
        }
        return await rp(options)
        .then((res) => {
            // console.log(res)
            return res
        })
        .catch(function (err) {
        })
    },

    //上传
    async upload(ctx){
        const ACCESS_TOKEN=await getAccessToken()
        //1请求对应地址
        const file=ctx.request.files.file
        const path=`swiper/${Date.now()}-${Math.random()*10000000}-${file.name}`
        const options={
            method:'POST',
            uri:`https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
            body:{
                path,
                env:ctx.state.env
            },
            json: true
        }
        const info= await rp(options)
        .then((res) => {
            return res
        })
        .catch(function (err) {
        })
        console.log(info)
        //上传图片
        const params={
            method:'POST',
            headers:{
                'content-type':'multipart/form-data',
            },
            uri:info.url,
            formData:{
                key:path,
                Signature:info.authorization,
                'x-cos-security-token':info.token,
                'x-cos-meta-fileid':info.cos_file_id,
                file:fs.createReadStream(file.path)
            },
            json: true
        }
        await rp(params)
        return info.file_id
    },
    //删除云存储中的文件
    async delete(ctx,fileid_list){
        const ACCESS_TOKEN=await getAccessToken()
        const options={
            method:'POST',
            uri:`https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
            body:{
                "fileid_list":fileid_list,
                env:ctx.state.env
            },
            json: true
        }
        return await rp(options)
        .then((res) => {
            console.log(res)
            return res
        })
        .catch(function (err) {
        })
    }
}
module.exports=CloudStorage