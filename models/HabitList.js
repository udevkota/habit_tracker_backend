const mongoose = require("mongoose");

const habitListSchema = new mongoose.Schema(
  {
    user: [
      {
        type: new mongoose.Schema(
          {
            userName: {
              type: String,
              required: true,
            },
            email: {
              type: String,
              required: true,
            },
            password: {
              type: String,
              required: true,
            },
          },
          { timestamps: true }
        ),
      },
    ],
    habit: [
      {
        type: new mongoose.Schema(
          {
            habitTitle: { type: String },
            numValue: { type: Number},
            unit: { type: String },
            completed: {
              type: Boolean,
              default: false,
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("HabitList", habitListSchema);
