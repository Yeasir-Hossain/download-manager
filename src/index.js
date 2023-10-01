const https = require("https");
const fs = require('fs');


/** 
 * https://www.tutorialspoint.com/cg/images/cgbanner.jpg
 * https://speed.hetzner.de/100MB.bin
*/

// Define the path where downloaded files will be saved
var dir = `./downloads/`;

// Create a readline interface to get user input
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Function to get the URL from the user
const getURL = () => {
    return new Promise((resolve, reject) => {
        readline.question(`Enter URL: `, url => {
            resolve(url.trim());
        });
    });
};

// Function to get the file name from the user
const getFileName = () => {
    return new Promise((resolve, reject) => {
        readline.question(`Enter File Name: `, url => {
            resolve(url.trim());
        });
    });
};

// Function to show download progress
function showDownloadingProgress(received, total) {
    var platform = "win32"; // For Windows system, use 'win32', for others, leave it empty
    var percentage = ((received * 100) / total).toFixed(2);
    process.stdout.write((platform == 'win32') ? "\x1b[0G" : "\r");
    process.stdout.write(percentage + "%");
}

/**
 * Function to download a file from a given URL and save it with a specified file name
 * @param {string} url - The URL of the file to be downloaded
 * @param {string} fileName - The name of the file to be downloaded (set by the user)
 * Save the file to the 'downloads' folder
 */
const downloadFile = (url, fileName) => {
    let totalFileSize = 0;
    let received = 0; 

    // Make an HTTP GET request to the provided URL
    https.get(url.trim(), (res) => {
        console.log('Download Started');

        // Get the file extension from the response headers
        const extension = res.headers['content-type'].split('/')[1];

        // Full path for saving the file, with the correct extension
        dir = dir + `${fileName}.${extension === 'octet-stream' ? 'bin' : extension}`

        const file = fs.createWriteStream(dir);
        // Get the total file size from the response headers
        totalFileSize = parseInt(res.headers['content-length']);

        // Listen for data chunks and update the download progress
        res.on('data', (chunk) => {
            received += chunk.length;
            showDownloadingProgress(received, totalFileSize)
        });

        // Pipe the response data to the file write stream
        res.pipe(file);

        // File download completed successfully
        file.on("finish", () => {
            file.close();
            console.log("Download Completed!");
        });

        // Handle any errors during file download
        file.on('error', (e) => {
            fs.unlink(dir, () => cb(e.message));
        });

    }).on('error', (e) => {
        console.error(e);
        fs.unlink(dir, () => cb(e.message));
    });
}

(async function () {
    // check if downloads folder is present, if not then create
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    const URL = await getURL();
    const fileName = await getFileName();
    downloadFile(URL, fileName);
})();
