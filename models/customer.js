const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");

const customerSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: "Invalid email format",
    },
  },
  total_spends: {
    type: Number,
    default: 0,
    min: [0, "Total spends cannot be negative"],
  },
  visits: {
    type: Number,
    default: 0,
    min: [0, "Visits cannot be negative"],
  },
  last_visit: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
