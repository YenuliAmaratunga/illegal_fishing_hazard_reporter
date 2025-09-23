const User = require('../models/UserSchema');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
  try {
    const { name, role,  phone, password,language } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

     const hashedPassword = await bcrypt.hash(password, 10)

    let userData = {name, role,  phone, password:hashedPassword,language};

    // Assign role-specific fields
    if (role === 'fisherman') {
      const { nationalId, boatName ,dob,homeAddress} = req.body;
      if (!nationalId || !boatName ) {
        return res.status(400).json({ message: "Fisherman must provide national ID and boat name" });
      }

      const refinedDate = new Date(dob); 
      const today = new Date();
      const age = today.getFullYear() - refinedDate.getFullYear();
      userData.nationalId = nationalId;
      userData.boatName = boatName;
      userData.age = age;
      userData.homeAddress = homeAddress;
    }

    if (role === 'marine') {
      const { badgeNumber, unit,email } = req.body;
      if (!badgeNumber || !unit || !email) {
        return res.status(400).json({ message: "Marine must provide badge number and unit" });
      }
      userData.badgeNumber = badgeNumber;
      userData.unit = unit;
      userData.email = email;
    }

    if (role === 'ngo') {
      const { organization,email } = req.body;
      if (!organization || !email) {
        return res.status(400).json({ message: "NGO must provide organization name" });
      }
      userData.organization = organization;
      userData.email = email;
    }

    const user = new User(userData);
    await user.save();

    return res.status(201).json({ message: "User registeration successfully sent to the department, pending approval" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.retrieveRequests= async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" }); // handle errors
  }
};

exports.statusBasedRequests = async(req,res) =>{

  try{

    const {status} = req.query;
    const filter = {};
    if(status) filter.status = status;

    const users = await User.find(filter);
    res.status(200).json(users);

  }catch(err){

    console.error(err);
    res.status(500).json({ message: "Server error" }); // handle errors
  
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body; // admin sends "approved" or "rejected"

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Only allow update if current status is pending
    if (user.status !== 'pending') {
      return res
        .status(400)
        .json({ message: `Request is already ${user.status}, cannot update` });
    }

    // Update to admin-specified status
    user.status = status; // must be a string
    await user.save();

    return res.status(200).json({
      message: `Status updated to ${status}`,
      user,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

