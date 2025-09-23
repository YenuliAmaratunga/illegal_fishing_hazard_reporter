const express = require('express');
const cors = require('cors');
const  mongoose  = require('mongoose');
// const fileUpload = require('express-fileupload');
const i18n = require('i18n');
const path = require('path');
const app = express();
const PORT = 8080
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const boatRoutes = require('./routes/boatRoutes');


app.use(express.json());
// app.use(fileUpload());

app.use('/api/User',userRoutes);
app.use('/api/Boat',boatRoutes);



mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));
app.listen(PORT,()=>{

    console.log(`App is running on the port ${PORT}`); 
})

