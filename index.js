const express = require('express')
const cors = require('cors');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY)


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
        const usersCollection = client.db("HMBR_TOOLS").collection("users");

        app.get('/tools', async(req, res)=>{
            const tools= await toolsCollection.find().sort({$natural:-1}).toArray();
            res.send(tools);
        })
        app.post('/tools', async(req, res)=>{
            const tool= req.body
            const result= await toolsCollection.insertOne(tool);
            res.send(result);
        })
        app.get('/reviews', async(req, res)=>{
            const reviews= await reviewsCollection.find().sort({$natural:-1}).toArray();
            res.send(reviews);
        })

        app.get('/tools/:id', async(req, res)=>{
            const id= req.params.id;
            const query={_id: ObjectId(id)};
            const result= await toolsCollection.findOne(query);
            res.send(result);
        });

        app.delete('/tools/:id', async(req, res)=>{
            const id= req.params.id;
            const query= {_id: ObjectId(id)};
            const result= await toolsCollection.deleteOne(query);
            res.send(result);
        } )

        // app.put('/toolsqytupdate/:id', async(req, res)=>{
        //     const id= req.params.id;
        //     const tool= req.body;
        //     const filter={_id: ObjectId(id)};
        //     const options= {upsert: true}
        //     const updateDoc={
        //         $set: tool,
        //     }
        //     const result= await toolsCollection.updateOne(filter,updateDoc, options);
        //     res.send(result);
        // });


        // app.put('/tools/:id', async(req, res)=>{
        //     const id= req.params.id;
        //     const tool= req.body;
        //     const filter={_id: ObjectId(id)};
        //     const options= {upsert: true}
        //     const updateDoc={
        //         $set: tool,
        //     }
        //     const result= await toolsCollection.updateOne(filter,updateDoc, options);
        //     res.send(result);
        // });


        app.get('/orders/:id', async(req, res)=>{
            const id= req.params.id;
            const query={_id: ObjectId(id)};
            const result= await ordersCollection.findOne(query);
            res.send(result);
        });

        app.patch('/orders/:id', async(req, res)=>{
            const id= req.params.id;
            const payment= req.body;
            const filter={_id: ObjectId(id)};
            const updateDoc={
                $set:{
                    paid:true,
                    paymentId: payment.paymentId,
                    status:'Pending'
                }
            }
            const result= await ordersCollection.updateOne(filter,updateDoc);
            res.send(result);
        });

        app.put('/manageorders/:id', async(req, res)=>{
            const id= req.params.id;
            const payment= req.body;
            const filter={_id: ObjectId(id)};
            const options= {upsert: true}
            const updateDoc={
                $set: payment,
            }
            const result= await ordersCollection.updateOne(filter,updateDoc, options);
            res.send(result);
        });

        app.delete('/orders/:id', async(req, res)=>{
            const id= req.params.id;
            const filter= {_id: ObjectId(id)};
            const result= await ordersCollection.deleteOne(filter);
            res.send(result);
        } )

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
        });

        app.get('/allorders', async(req, res)=>{
            const result= await ordersCollection.find().toArray();
            res.send(result);
        });

        app.post('/create-payment-intent', async(req, res)=>{
            const purchaseOrder= req.body;
            const amount= purchaseOrder.amount*100;
            const paymentIntent= await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({clientSecret: paymentIntent.client_secret})
        });

        app.post('/reviews', async(req,res)=>{ 
            const review= req.body;
            const result= await reviewsCollection.insertOne(review);
            res.send(result);
        });

        app.post('/users', async(req, res)=>{
            const user= req.body;
            const result= await usersCollection.insertOne(user);
            res.send(result);
        })

        app.put('/users/:email', async(req, res)=>{
            const user= req.body;
            const email= req.params.email;
            const filter= {email: email};
            const options = { upsert: true };
            const updateDoc={
                $set:user,
            }
            const result= await usersCollection.updateOne(filter,updateDoc,options);
            res.send(result);
        });


        app.get('/users/', async(req, res)=>{
            const email= req.query.email;
            const filter= {email: email};
            const result= await usersCollection.findOne(filter);
            res.send(result);
        })
        app.get('/allusers', async(req, res)=>{
            const result= await usersCollection.find().toArray();
            res.send(result);
        })

        app.delete('/users/:id', async(req, res)=>{
            const id= req.params.id;
            const filter= {_id: ObjectId(id)};
            const result= await usersCollection.deleteOne(filter);
            res.send(result);
        } )

        



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