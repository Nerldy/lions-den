const server = require('./server');

const PORT = 3000;

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Serving on port ${PORT}`));
