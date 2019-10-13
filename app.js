const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const cors=require('koa2-cors')
const koaBody=require('koa-body')
//云函数环境id
const ENV='test-4qajy'

//解决跨域问题
app.use(cors({
    origin:['http://localhost:9528'],
    //证书
    credentials:true
}))

//接收参数的解析
app.use(koaBody({
    multipart:true
}))

app.use(async (ctx,next)=>{
    console.log('全局中间件')
    ctx.state.env=ENV
    await next()
})
//导入 controller文件
const playlist = require('./controller/playlist.js')   
const swiper = require('./controller/swiper.js') 
const blog=require('./controller/blog.js')

router.use('/playlist', playlist.routes())
router.use('/swiper',swiper.routes())
router.use('/blog',blog.routes())

app.use(router.routes())
app.use(router.allowedMethods())



app.listen(3000,()=>{
    console.log('服务开启在3000端口')
})
