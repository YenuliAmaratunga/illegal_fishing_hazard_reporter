const app = require('./app');

const PORT = process.env.PORT || 5002;  

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Marine Police Service is running on port ${PORT}`);
});

