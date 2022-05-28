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

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized Access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
           return res.status(403).send({ message: 'Forbidden Access'})
        }
        req.decoded = decoded;
        next();
    });
}



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

// API For GET all tools from database

        app.get('/tools', async (req, res) => {
            const tools = await toolsCollection.find().sort({ $natural: -1 }).toArray();
            res.send(tools);
        });

// API For Post tools/add product to database

        app.post('/tools', async (req, res) => {
            const tool = req.body
            const result = await toolsCollection.insertOne(tool);
            res.send(result);
        })

// API For GET all reviews and show in homepage from database
     
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewsCollection.find().sort({ $natural: -1 }).toArray();
            res.send(reviews);
        })

// API For GET  tools by Id from database

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.findOne(query);
            res.send(result);
        });

// API For Delete tools by Id  from database

        app.delete('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.deleteOne(query);
            res.send(result);
        })

// API For Update Product with a Moda  from database (not in use)

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

// API For GET Orders by Id  from database

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.findOne(query);
            res.send(result);
        });

// API For Update Orders by Id for giving status after payment  to database

        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    paid: true,
                    paymentId: payment.paymentId,
                    status: 'Pending'
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

// API For Update Orders Status by Id to database

        app.put('/manageorders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: payment,
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

// API For Delete Orders by Id  from database

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(filter);
            res.send(result);
        })


// API For Post a Orders to database


        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.send(result);
        });

// API For GET All Orders by email query from database

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const result = await ordersCollection.find(filter).toArray();
            res.send(result);
        });

// API For GET All Orders from database

        app.get('/allorders', async (req, res) => {
            const result = await ordersCollection.find().toArray();
            res.send(result);
        });

// API For Payment 

        app.post('/create-payment-intent', async (req, res) => {
            const purchaseOrder = req.body;
            const amount = purchaseOrder.amount * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        });

// API for post a reveiws from user to database

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

// API For Post a user to database

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

// API For Update a User by geting with email id as params

        app.put('/users/:email', async (req, res) => {
            const user = req.body;
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
            console.log(token);
            res.send({result,token});
        });

// API For get a users from database by email query

        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const result = await usersCollection.findOne(filter);
            res.send(result);
        })

// API For Get all users from database

        app.get('/allusers', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

// API For Delete a user by id from database

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })





    } finally {

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('HMBR International Server Is Running')
})

app.listen(port, () => {
    console.log(`Makete app listening on port ${port}`)
})