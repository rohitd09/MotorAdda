const mongoose = require("mongoose");

const ParkingLocationSchema = new mongoose.Schema({
  parking_spot_owner: String,
  parking_spot_name: String,
  parking_spot_location: String,
  number_of_available_spots: {
      type: Number,
      default: 0
  },
  open_time: {
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    minute: {
      type: Number,
      min: 0,
      max: 59
    }
  },
  close_time: {
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    minute: {
      type: Number,
      min: 0,
      max: 59
    }
}});

module.exports = mongoose.model("ParkingLocation", ParkingLocationSchema)