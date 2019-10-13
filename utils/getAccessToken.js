//引入promise包
const rp=require('request-promise')
//引入读写文件的模块
const fs=require('fs')
//路径包
const path=require('path')
//创建文件的名称
const fileName=path.resolve(__dirname,'./access_token.json')
//微信APPID
const APPID='wx7a373e2348bee476'
//微信APPSECRET
const APPSECRET='2b5a3d8626c6421fdf924960bd70717e'
//微信访问URL
const URL=`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`

const updateAccessToke =async ()=>{
   const resStr= await rp(URL)
   const res=JSON.parse(resStr)
//    console.log(res)
   //写文件
   if(res.access_token){
       fs.writeFileSync(fileName,JSON.stringify({
           access_token:res.access_token,
           createTime:new Date()
       }))
   }else{
    await updateAccessToke()
   }
}
//取得已获得的token
const  getAccessToken=async ()=>{
    try {
        //只要去json文件中去读取 该情况为access_token.json文件存在的情况
       const readRes= fs.readFileSync(fileName,'utf8')
       const readObj=JSON.parse(readRes)
       //防止出现服务器宕机的情况
       const createTimeForRead=new Date(readObj.createTime).getTime()
       //当前时间毫秒数
       const nowTime=new Date().getTime()
       if((nowTime-createTimeForRead)/1000/60/60>=2){
           await updateAccessToke()
           await getAccessToken()
       }
       return readObj.access_token
    } catch (error) {
       await updateAccessToke()
       await getAccessToken()
    }
}

//开启定时器
setInterval(async()=>{
    updateAccessToke()
},(7200-300)*1000)

// updateAccessToke()
//模块导出
module.exports=getAccessToken