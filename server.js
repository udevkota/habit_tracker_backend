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

//Get <scheduled> habits by userId
app.get("/habitlists/:userId", (req, res) => {
  HabitList.findById(req.params.userId)
    .then((results) => {
      if (results) {
        res.status(200).json(results);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((error) => res.status(400).json({ message: "Bad request" }));
});

//Add user 
app.post("/user", (req, res) => {
  const newHabitList = new HabitList(req.body);
  newHabitList.save();
  res.status(201).json(newHabitList);
});

//Add <scheduled> habit
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

//update userName 
app.patch("/habitlists/:userId/user", (req, res) => {
  HabitList.findById(req.params.userId)
    .then((habitList) => {
      // if user is not found, return 404
      if (habitList) {
        habitList.userName = req.body.userName || habitList.userName;
        habitList.save();
        res.status(200).json(habitList);
      } else {
        res.status(404).json({ message: "not found" });
      }
    })
    .catch((error) => res.status(400).json({ message: "Bad request" }));
});

//update <scheduled> habit 
//habitList refers to the user info + habit info, probably need to rename
app.patch("/habitlists/:userId/habits/:habitId", (req, res) => {
  HabitList.findById(req.params.userId)
    .then((habitList) => {
      if (!habitList) {
        res.status(404).json({ message: "User not found" });
      } else {
        const habit = habitList.scheduledHabitList.id(req.params.habitId);
        if (!habit) {
          res.status(404).json({ message: "Habit not found" });
        } else {
          const { habitTitle, frequency } = req.body;
          habit.habitTitle = habitTitle || habit.habitTitle;
          habit.frequency = frequency || habit.frequency;
          habitList
            .save()
            .then(() => res.status(200).json(habit))
            .catch((error) => res.status(400).json({ message: error.message }));
        }
      }
    })
    .catch((error) => res.status(400).json({ message: error.message }));
});

//updated or toggle completed boolean on and off
app.patch("/habitlists/:userId/habits/:habitId/status", (req, res) => {
  HabitList.findById(req.params.userId)
    .then((habitList) => {
      if (!habitList) {
        res.status(404).json({ message: "User not found" });
      } else {
        const habit = habitList.scheduledHabitList.id(req.params.habitId);
        if (!habit) {
          res.status(404).json({ message: "Habit not found" });
        } else {
          habit.completed = !habit.completed;
          habitList
            .save()
            .then(() => res.status(200).json(habit))
            .catch((error) => res.status(400).json({ message: error.message }));
        }
      }
    })
    .catch((error) => res.status(400).json({ message: error.message }));
});

//delete user
app.delete("/habitlists/:userId", (req, res) => {
  HabitList.findByIdAndDelete(req.params.userId)
    .then((habitList) => {
      if (habitList) {
        res.status(200).json({ deleted: habitList });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((error) => res.status(400).json({ message: "Bad request" }));
});

//delete <scheduled> habit
app.delete("/habitlists/:userId/habits/:habitId", (req, res) => {
  HabitList.findById(req.params.userId)
    .then((habitList) => {
      if (habitList) {
        habitList.scheduledHabitList.id(req.params.habitId).deleteOne();
        habitList.save();
        res.status(200).json({ message: "Habit deleted" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((error) => res.status(400).json({ message: "Bad request" }));
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
