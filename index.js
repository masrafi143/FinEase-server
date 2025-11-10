const express = require("express");
const cors = require("cors");
require('dotenv').config()
// console.log(process.env)
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;


// middleware
app.use(cors());
app.use(express.json());

// FinEaseDB
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrmmuai.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart-deals server is running");
});

app.listen(port, () => {
  console.log(`Smart-deals server listening on port ${port}`);
});

async function run() {
  try {
    await client.connect();

    const db = client.db("finease_db");
    const transactionCollection = db.collection("transactions");


    // Treansactions APIs
    app.get("/transactions", async (req, res) => {
      // const projectField = {title: 1, price_min:1, price_max:1, image:1};
      // const cursor = productsCollection.find().sort({price_min : 1}).skip(2).limit(2).project(projectField);
      const cursor = transactionCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });



    app.post("/transactions", async (req, res) => {
      const newTransaction = req.body;
    //   console.log('new transaction', newTransaction);
      const result = await transactionCollection.insertOne(newTransaction);
      res.send(result);
    });



    // my-transactions
    app.get("/transactions", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = transactionCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });


    // delete-transaction
    app.delete("/transactions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await transactionCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
