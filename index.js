const express = require('express')
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
        const ordersCollection = client.db("HMBR_TOOLS").collection("orders");

        app.get('/tools', async(req, res)=>{
            const tools= await toolsCollection.find().toArray();
            res.send(tools);
        })
        app.get('/reviews', async(req, res)=>{
            const tools= await reviewsCollection.find().sort({$natural:-1}).toArray();
            res.send(tools);
        })

        app.get('/tools/:id', async(req, res)=>{
            const id= req.params.id;
            const query={_id: ObjectId(id)};
            const result= await toolsCollection.findOne(query);
            res.send(result);
        });
        app.get('/orders/:id', async(req, res)=>{
            const id= req.params.id;
            const query={_id: ObjectId(id)};
            const result= await ordersCollection.findOne(query);
            res.send(result);
        });

        app.post('/orders', async(req, res)=>{
            const orders= req.body;
            const result= await ordersCollection.insertOne(orders);
            res.send(result);
        });

        app.get('/orders', async(req, res)=>{
            const email= req.query.email;
            const filter= {email: email};
            const result= await ordersCollection.find(filter).toArray();
            res.send(result);
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