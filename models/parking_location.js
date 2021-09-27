const mongoose = require("mongoose");

const ParkingLocationSchema = new mongoose.Schema({
  parking_spot_owner: String,
  parking_spot_name: String,
  parking_spot_location: String,
  number_of_available_spots: {
      type: Number,
      default: 0
  },
  open_time: String,
  close_time: String
});

module.exports = mongoose.model("ParkingLocation", ParkingLocationSchema)