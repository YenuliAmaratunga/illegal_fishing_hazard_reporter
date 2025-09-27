const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['fisherman', 'marine', 'admin', 'ngo'], required: true },
  phone:{type : String, required : true } ,
  password: {type : String, required : true},
  language : {type : String, enum : ['Sinhala', 'Tamil', 'English'], required : true},
  
  // Fisherman-specific
  nationalId: {type : String},
  boatName: {type :String},
  dob : {type : Date},
  age : {type : Number},
  homeAddress : {type : String},
  
  // Marine-specific
  badgeNumber: {type : String},
  unit: {type :String },
  email: { type: String, unique: true, sparse: true },
  
  // NGO-specific
  organization: {type :String},
  
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
