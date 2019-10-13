const Router = require('koa-router')
const router = new Router()
//引入获取access_token文件
const getAccessToken=require('../utils/getAccessToken.js')
const rp=require('request-promise')
const callCloudDB=require('../utils/callCloudDB')
const callCloudStorage=require('../utils/callCloudStorage')

router.get('/list',async(ctx,next)=>{
    //默认获取10条
    const query=`
        db.collection('swiper').get()
    `
   const res= await callCloudDB(ctx,'databasequery',query)
   const data=res.data
   //网页不能image组件不能直接使用云文件fileid直接加载 需要去获取download_url
   //调用文件下载
   const fileList=[]
   for(let i=0;i<data.length;i++){
       fileList.push({
        fileid:JSON.parse(data[i]).fileid,
        max_age:7200
       })
   }
   const downRes= await callCloudStorage.download(ctx,fileList)
//    console.log(downRes)
   //构建返回数组
   const returnRes=[]
   for(let i=0;i<downRes.file_list.length;i++){
    returnRes.push({
        download_url:downRes.file_list[i].download_url,
        fileid:downRes.file_list[i].fileid,
        _id:JSON.parse(data[i])._id
    })
   }
   ctx.body={
       code:20000,
       data:returnRes
   }
})

router.post('/upload',async(ctx,next)=>{
   const fileid= await callCloudStorage.upload(ctx)
   console.log(fileid)
   //写入数据库中
   const query=`db.collection('swiper').add({
       data:{
           fileid:'${fileid}'
       }
   })`
   const res=await callCloudDB(ctx,'databaseadd',query)
   ctx.body={
       code:20000,
       id_list:res.id_list
   }
})

router.get('/del',async(ctx,next)=>{
    //1删除数据库中的内容
    const params=ctx.request.query
    console.log(params)
    const query=`db.collection('swiper').doc('${params._id}').remove()`
    const delDBRes=await callCloudDB(ctx,'databasedelete',query)

    //2 删除云存储中的文件by fileid
    const delStorageRes=await callCloudStorage.delete(ctx,[params.fileid])
    ctx.body={
        code:20000,
        data:{
            delDBRes,
            delStorageRes,
        }
    }

})

module.exports=router