const http = require('http');

const parseArgs = () => {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '-u':
            case '--url':
                options.url = args[++i];
                break;
            case '-r':
            case '--requests':
                options.concurrentRequests = parseInt(args[++i], 10);
                break;
            default:
                break;
        }
    }
    return options;
};

const options = parseArgs();

if (!options.url || !options.concurrentRequests) {
    console.error('Usage: node app.js --url <URL> --requests <number>');
    process.exit(1);
}

const targetUrl = options.url;
const concurrentRequests = options.concurrentRequests;

let completedRequests = 0;
let failedRequests = 0;

const sendRequest = () => {
    return new Promise((resolve) => {
    const req = http.get(targetUrl, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
            completedRequests++;
            resolve();
        });
    });

    req.on('error', (error) => {
        failedRequests++;
        resolve();
    });

    req.end();
    });
};

const start = async () => {
    console.log(`sending to ${targetUrl} with ${concurrentRequests} requests...`);

    while (true) {
        const requests = [];

        for (let i = 0; i < concurrentRequests; i++) {
            requests.push(sendRequest());
        }

        await Promise.all(requests);

        console.log(`completed requests: ${completedRequests}`);
        console.log(`failed requests: ${failedRequests}`);

        completedRequests = 0;
        failedRequests = 0;

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

start();
