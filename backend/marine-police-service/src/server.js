const app = require('./app');

const PORT = process.env.PORT || 5002;  

app.listen(PORT, () => {
    console.log(`Marine Police Service is running on port ${PORT}`);
});

