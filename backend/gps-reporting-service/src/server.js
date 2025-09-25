const app = require('./app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`GPS Reporting Service is running on port ${PORT}`);
});

