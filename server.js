const express = require('express')
const { sendStatus } = require('express/lib/response')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
mongoose.Promise = Promise


const dbUrl = '_____' //your mongo link
const PORT = 3000

app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const Message = mongoose.model('Message',{
    name: String,
    message: String
})


app.get('/messages', (req, res)=>{
    Message.find({}, (err, messages)=>{
        res.send(messages)
    })
})

app.post('/messages', async (req, res)=>{
   try{
       const message = new Message(req.body)
   
   
       //save message and remove keywords
       const savedMessages = await message.save()
   
       const censored = await Message.findOne({message: 'fuck' })
   
       if(censored)
           await Message.deleteOne({_v: censored.id})
       else
           io.emit('message', req.body)
           console.log('bad word censored')    
       
       res.sendStatus(200)
   }catch(error){
    res.sendStatus(500)
    console.log(error)
   }
    
})


//socket.io to report new connections
io.on('connection', (socket)=>{
    console.log('a new is user connected')
})

mongoose.connect(dbUrl,  {useUnifiedTopology: true},  (err) =>{
    console.log(err)
})
//to use socket. io to handle notfications replace app.lis... with http.lis...
const server = http.listen(PORT, ()=>{
    console.log(`server started on Port ${server.address().port} visit
    http://localhost:${server.address().port}/ to see it`)
})