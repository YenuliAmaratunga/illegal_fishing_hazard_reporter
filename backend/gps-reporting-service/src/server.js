const app = require('./app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`GPS Reporting Service is running on port ${PORT}`);
});

