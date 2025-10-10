const mongoose = require('mongoose');
const { format } = require('path');


const ImageSchema = new mongoose.Schema({

    public_id : {type : String},
    secure_url : {type : String},
    format : {type : String},
    width : {type : Number},
    height : {type : Number},
    uploadedAt : {type : Date, default : Date.now},
    



});

const BoatSchema = new mongoose.Schema({

    fishermanId :{

        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true

    },

    boatName :{type : String, required : true,unique : true},
    registrationNumber : {type : String, required : true,unique : true},
    boatType : {type : String, required : true},
    length : {type : Number, required : true},
    capacity : {type : Number, required : true},
    engineType : {type : String, required : true},
    homePort : {type : String, required : true},
    insuranceNumber :{type : String, required : true, unique : true},
    safetyEquipment : [{type : String}],
    images: {
    type: [ImageSchema],
    required: true,
  },  
  
  license: {
    public_id: { type: String, required: true },
    secure_url: { type: String, required: true },
    format: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },

  status : {type : String, enum : ['pending', 'approved', 'rejected'], default : 'approved'}






},{timestamps : true});

module.exports = mongoose.model('Boat',BoatSchema);


