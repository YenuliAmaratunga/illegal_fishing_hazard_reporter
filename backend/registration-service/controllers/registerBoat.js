
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier')
const Boat = require('../models/BoatSchema');

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}



exports.registerBoat = async(req,res)=>{

    try{

        const{boatName,registrationNumber,boatType,length,capacity,engineType,homePort,insuranceNumber,safetyEquipment} = req.body;
        const licenseFile = req.files?.license?.[0];
        const imageFiles = req.files?.images || [];

        // 1) Upload license 

if (!licenseFile) {
  return res.status(400).json({ message: "License file is required to register a boat" });
}

// 2) Upload license to Cloudinary
const licResult = await uploadBufferToCloudinary(licenseFile.buffer, {
  folder: `boats/68d148cceaaa3f988ffe54e1/license`,
  resource_type: 'auto' // handles pdf/images
});

const licenseMeta = {
  public_id: licResult.public_id,
  secure_url: licResult.secure_url,
  format: licResult.format,
  uploadedAt: new Date()
};

    // 2) Upload images (parallel)
    const imageUploadPromises = imageFiles.map(file =>
      uploadBufferToCloudinary(file.buffer, {
        folder: `boats/68d148cceaaa3f988ffe54e1/images`,
        resource_type: 'image',
        // transformation: [{ width: 1600, crop: 'limit' }]
      })
    );

    const imageResults = await Promise.all(imageUploadPromises);

    const imagesMeta = imageResults.map(r => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      format: r.format,
      width: r.width,
      height: r.height,
      uploadedAt: new Date()
    }));

      const newBoat = new Boat({
      fishermanId: '68d148cceaaa3f988ffe54e1',
      boatName,
      registrationNumber,
      boatType,
      length,
      capacity,
      engineType,
      homePort,
      insuranceNumber,
      safetyEquipment,
      images: imagesMeta,
      license: licenseMeta
    });



        const savedBoat = await newBoat.save();
        if(!savedBoat) res.status(400).json({message : "Error in Saving Boat"});
        res.status(200).json({message : `${boatName} Registered successfully under ${savedBoat._id}`});

    }catch(err){
  console.error("Boat registration error:", err);
  res.status(500).json({message : "Server Error Occured", error: err.message});
  }

}

exports.viewAllBoats = async(req,res)=>{

    try{

        const boats = await Boat.find();
        if(!boats) res.status(204).json({message : "No Boats Available"});
        res.status(200).json(boats);

    }catch(err){

        res.status(500).json({message : "Internal Server Error"});
    }
}

