const express = require("express");
const cors = require("cors");
require("dotenv").config();
// console.log(process.env)
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// FinEaseDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrmmuai.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("FinEase server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("finease_db");
    const transactionCollection = db.collection("transactions");
    //const bidsCollection = db.collection("bids");
    const usersCollection = db.collection("users");
    // USER APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user already exist, no need to insert" });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      console.log("Fetching transactions for:", email);
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Treansactions APIs
    // app.get("/transactions", async (req, res) => {
    //   // const projectField = {title: 1, price_min:1, price_max:1, image:1};
    //   // const cursor = productsCollection.find().sort({price_min : 1}).skip(2).limit(2).project(projectField);
    //   const cursor = transactionCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    //     // latest products
    //     app.get("/latest-products", async (req, res) => {
    //       const cursor = productsCollection
    //         .find()
    //         .sort({ created_at: -1 })
    //         .limit(6);
    //       const result = await cursor.toArray();
    //       res.send(result);
    //     });
    app.get("/transactions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await transactionCollection.findOne(query);
      res.send(result);
    });

    // my-transactions
    app.get("/transactions", async (req, res) => {
      const email = req.query.email;
      console.log("Fetching transactions for:", email);
      const query = {};
      if (email) {
        query.user_email = email;
      }
      const cursor = transactionCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // add-transactions
    app.post("/transactions", async (req, res) => {
      const newTransaction = req.body;
      //   console.log('new transaction', newTransaction);
      const result = await transactionCollection.insertOne(newTransaction);
      res.send(result);
    });

    // Update a transaction by ID
    app.patch("/transactions/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTransaction = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          type: updatedTransaction.type,
          description: updatedTransaction.description,
          category: updatedTransaction.category,
          amount: updatedTransaction.amount,
          date: updatedTransaction.date,
        },
      };
      const result = await transactionCollection.updateOne(query, update);
      res.send(result);
    });

    //     app.delete("/products/:id", async (req, res) => {
    //       const id = req.params.id;
    //       const query = { _id: new ObjectId(id) };
    //       const result = await productsCollection.deleteOne(query);
    //       res.send(result);
    //     });

    //     app.get("/products/bids/:productId", async (req, res) => {
    //       const productId = req.params.productId;
    //       const query = { product: productId };
    //       const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
    //       const result = await cursor.toArray();
    //       res.send(result);
    //     });

    //     app.post("/bids", async (req, res) => {
    //       const myBid = req.body;
    //       const result = await bidsCollection.insertOne(myBid);
    //       res.send(result);
    //     });

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

app.listen(port, () => {
  console.log(`FinEase server listening on port ${port}`);
});
