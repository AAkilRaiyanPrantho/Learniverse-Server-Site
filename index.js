const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

// Mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shklq4p.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentCollections = client
      .db("learniverse")
      .collection("allAssignments");

    const assignmentSubmissions = client
      .db("learniverse")
      .collection("allSubmissions");

    // Read all data
    app.get("/assignments", async (req, res) => {
      const cursor = assignmentCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Read data to Update assignments
    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignmentCollections.findOne(query);
      res.send(result);
    })

    // Update Data for assignments
    app.put("/assignments/:id", async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const updatedAssignment = req.body;
      const assignment = {
        $set: {
          title: updatedAssignment.title,
          thumbnail: updatedAssignment.thumbnail,
          assignmentDifficultyLevel: updatedAssignment.assignmentDifficultyLevel,
          marks: updatedAssignment.marks,
          assignmentDescription: updatedAssignment.assignmentDescription,
          dueDate: updatedAssignment.dueDate
        }
      }
      const result = await assignmentCollections.updateOne(filter, assignment,options);
      res.send(result);
    })


    // Reading all submitted data from the data base
    app.get("/submissions", async (req, res) => {
      console.log(req.query);
      const cursor = assignmentSubmissions.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Read personal submission data
    app.get("/mySubmissions", async (req, res) => {
      console.log(req.query.submitterEmail);
      let query = {};
      if (req.query?.submitterEmail) {
        query = { submitterEmail: req.query.submitterEmail };
      }
      const result = await assignmentSubmissions.find(query).toArray();
      res.send(result);
    });


    // Read data to Update checked assignments
    app.get("/submissions/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignmentSubmissions.findOne(query);
      res.send(result);
    })


    // Update Data for assignment checking
    app.put("/submissions/:id", async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const updatedMarks = req.body;
      const marks = {
        $set: {
          status: updatedMarks.status,
          feedback: updatedMarks.feedback,
          marks: updatedMarks.marks,
          
        }
      }
      const result = await assignmentCollections.updateOne(filter, marks,options);
      res.send(result);
    })

    //Posting New Assignments to the DataBase
    app.post("/assignments", async (req, res) => {
      const newAssignments = req.body;
      console.log(newAssignments);
      const result = await assignmentCollections.insertOne(newAssignments);
      res.send(result);
    });

    // Delete Operations
    app.delete('/assignments/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignmentCollections.deleteOne(query);
      res.send(result);
    })

    //Posting Submitted Assignments to the DataBase
    app.post("/submissions", async (req, res) => {
      const newSubmission = req.body;
      console.log(newSubmission);
      const result = await assignmentSubmissions.insertOne(newSubmission);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
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

app.get("/", (req, res) => {
  res.send("Learning is ON");
});

app.listen(port, () => {
  console.log(`Learniverse is live on port ${port}`);
});
