const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.emrwzgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server
    // await client.connect();
    console.log("Connected to MongoDB");

    // Get the collection
    const assignmentDataCollection = client
      .db("assignmentDB")
      .collection("assignmentData");

    // assignment submission collection
    const submissionAssignmentCollection = client
      .db("assignmentDB")
      .collection("submittedAssignments");

    // assignment create api
    app.post("/createassignment", async (req, res) => {
      const assignData = req.body;
      try {
        const result = await assignmentDataCollection.insertOne(assignData);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(400).send(error);
      }
    });

    // assignment submit api
    app.post("/submitAssignment", async (req, res) => {
      const submitAssignment = req.body;
      try {
        const result = await submissionAssignmentCollection.insertOne(
          submitAssignment
        );
        res.send(result);
      } catch (error) {
        res.status(401).send(error);
      }
    });

    // assignment update api
    app.put("/updateAssignment", async (req, res) => {
      const updateAssignment = req.body;
      const id = updateAssignment?.id;

      // console.log(id);

      try {
        const query = { _id: new ObjectId(id) };

        const updateDoc = {
          $set: {
            Title: updateAssignment?.Title,
            dueDate: updateAssignment?.dueDate,
            thumbnailImage: updateAssignment?.thumbnailImage,
            difficulty: updateAssignment?.difficulty,
            Description: updateAssignment?.Description,
          },
        };

        const result = await assignmentDataCollection.updateOne(
          query,
          updateDoc,
          { $options: true }
        );
        res.send(result);
      } catch (error) {
        res.status(401).send(error);
      }
    });

    // get all assingmet data api
    app.get("/assignments", async (req, res) => {
      try {
        const result = await assignmentDataCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(400).send(error);
      }
    });


    // submitted assignment data loaded api
    app.get("/submittedAssignmentData", async(req, res) => {
      const email = req?.query?.email;
      const pending = req.query.pending;
      console.log(pending);

      try{
        const filter = {email: email};

        if(pending){
          filter.assignmentStatus = pending;
        }
        const result = await submissionAssignmentCollection.find(filter).toArray();
        res.send(result);
      }catch(erro){
        res.status(401).send(erro);
      }
    })

    // delete the assignment api
    app.delete("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await assignmentDataCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(400).send(error);
      }
    });

    app.get("/", (req, res) => {
      res.send("The server is running from assignment server");
    });

    // Ping the database to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log("Server running on port:", port);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
