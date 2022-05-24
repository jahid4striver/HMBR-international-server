const express = require('express')
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vsynq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect()
        console.log('DB Connected');
        const toolsCollection = client.db("HMBR_TOOLS").collection("tools");
        const reviewsCollection = client.db("HMBR_TOOLS").collection("reviews");

        app.get('/tools', async(req, res)=>{
            const tools= await toolsCollection.find().toArray();
            res.send(tools);
        })
        app.get('/reviews', async(req, res)=>{
            const tools= await reviewsCollection.find().sort({$natural:-1}).toArray();
            res.send(tools);
        })



    } finally {

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Makute International Server Is Running')
})

app.listen(port, () => {
    console.log(`Makete app listening on port ${port}`)
})