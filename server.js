require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')

const app = express();
const PORT = 3000;

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.once("open", () => console.log("connected to mongoDB!!!!"));

const HabitList = require("./models/HabitList");

app.use(express.json());
app.use(cors())

//Get all DATA
app.get("/everything", (req, res) => {
  HabitList.find().then((results) => res.status(200).json(results));
});

//Add user 
app.post("/user", (req, res) => {
  const newHabitList = new HabitList(req.body);
  newHabitList.save();
  res.status(201).json(newHabitList);
});

//Add habit
app.post("/user/:userId/habits", (req, res) => {
  HabitList.findById(req.params.userId)
    .then((habitList) => {
      if (habitList) {
        habitList.scheduledHabitList.push({ habitTitle: req.body["habitTitle"], frequency: req.body["frequency"], completed: req.body["completed"] });
        habitList.save();
        return res.status(200).json(habitList);
      } else {
        return res.status(404).json({ message: "not found" });
      }
    })
    .catch((error) => res.status(400).json({ message: "Bad request" }));
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
