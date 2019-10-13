const Router = require('koa-router')
const router = new Router()
//引入获取access_token文件
const getAccessToken=require('../utils/getAccessToken.js')

const rp=require('request-promise')

const callCloudDB=require('../utils/callCloudDB')
const callCloudStorage=require('../utils/callCloudStorage')

router.get('/list',async(ctx,next)=>{
    const params=ctx.request.query
    console.log(params)
    const query = `
    db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createTime', 'desc').get()
`   
    const res = await callCloudDB(ctx, 'databasequery', query)
    // console.log(res)
    ctx.body = {
        code: 20000,
        data: res.data
    }
})

router.post('/delete',async(ctx,next)=>{
    //post应在body里面获取请求参数
    const params = ctx.request.body
    console.log(params)
    //删除blog
    const queryBlog = `db.collection('blog').doc('${params._id}').remove()`
    const delBlogRes=await callCloudDB(ctx,'databasedelete',queryBlog)
    // console.log(delBlogRes)
    //删除blog评论
    const queryComment=`db.collection('blog-comment').where({
        blogId:'${params._id}'
    }).remove()`
    const delBlogCommentRes=await callCloudDB(ctx,'databasedelete',queryComment)
    // console.log(delBlogCommentRes)

    //删除图片
    const delBlogImgRes=await callCloudStorage.delete(ctx,params.images)
    // console.log(delBlogImgRes)

    ctx.body={
        code:20000,
        data:{
            delBlogRes,
            delBlogImgRes,
            delBlogCommentRes
        }
    }
})

module.exports=router