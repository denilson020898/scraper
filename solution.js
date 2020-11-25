const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

var run = async () => {
    const data = await fs.readFile("test.js")
    console.log(data.toString());
}

run();