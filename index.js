const dns = require('node:dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const dotenv = require('dotenv')
 dotenv.config();
const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI

const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("petnestserver")
    const petInfoCollection = db.collection("petInfo")
    const adoptionCollection = db.collection("adoption")
    
    //  getPents info
    app.get('/petsinfo', async(req, res)=>{
        const result = await petInfoCollection.find().toArray()
        res.json(result);
    })

    // addpets infor
    app.post('/petsinfo', async(req, res)=>{
        const petInfoData = req.body
        const result = await petInfoCollection.insertOne(petInfoData)
        res.json(result)
    })

    //pets adoption post 
    app.post('/adoptioninfo', async(req, res)=>{
        const adoptionData = req.body
        const result = await adoptionCollection.insertOne(adoptionData)
        res.json(result)
    })

    //pets adoption get 
  app.get('/adoptioninfo/check', async (req, res) => {
  const { userEmail, id} = req.query;

  const existingRequest = await adoptionCollection.findOne({
    userEmail: userEmail,
    id: id
  });

  res.send({
    exists: !!existingRequest
  });
});
    
    // getPets infor one details
    app.get('/petsinfo/:id', async(req, res)=>{
       const {id} = req.params
       const result = await petInfoCollection.findOne({_id:new ObjectId(id)})
       res.json(result);
    })

    //user id diye get 
    app.get('/pets/:userId', async(req, res)=>{
          const {userId} = req.params
          const result = await petInfoCollection.find({userId:userId}).toArray()
          res.json(result);
    })
    
    // pet info update
    app.patch('/petsinfo/:id', async(req, res)=>{
        const {id} = req.params
        const updateData = req.body

        const result = await petInfoCollection.updateOne(
          {_id: new ObjectId(id)},
          {$set: updateData}
        )
        res.json(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res)=>{
    res.send('server is running fine');
})


module.exports = app;

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})