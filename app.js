const fs = require("fs");
const puppeteer = require("puppeteer");
const screenshot = require("./src/screenshot");
const saveReport = require("./src/save_report");

// process arguments
let url = process.argv[2];
if (!url) {
	console.log(
		"No arguments passed to specify url. Defaulting to http://localhost:3000 \n"
	);
	url = "http://localhost:3000";
}

const puppeteerConnect = async (url) => {
	const browser = await puppeteer.launch({
		// headless: false,
		// slowMo: 250,
	});

	const page = await browser.newPage();
	await page.setViewport({ width: 1980, height: 1000 });
	page.setDefaultTimeout(10000);

	try {
		await page.goto(url, {
			waitUntil: "networkidle2",
		});
	} catch (err) {
		console.log(
			"Having trouple establishing a connection. If you are attempting to connect to localhost try entering the url as your local ip address"
		);
		console.log(err);
		browser.close();
		return;
	}

	// helper function to wait for a specified period of time
	const delay = (time) => {
		return new Promise(function (resolve) {
			setTimeout(resolve, time);
		});
	};

	// get the current date in YYYY-MM-DD format (for creating directories)
	let timeStamp = Date.now();
	let dateObject = new Date(timeStamp);
	let date = dateObject.getDate();
	let month = dateObject.getMonth() + 1;
	let year = dateObject.getFullYear();

	const directory = `./outputs/${
		year + "-" + month + "-" + date + "-" + timeStamp
	}`;
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}

	const tempImagesDir = "./outputs/tempImages";
	if (!fs.existsSync(tempImagesDir)) {
		fs.mkdirSync(tempImagesDir, { recursive: true });
	}

	// take screenshots of charts
	try {
		await screenshot.takeScreenshots(page, directory, tempImagesDir);
	} catch (err) {
		console.log(
			"\x1b[36m%s\x1b[0m",
			" \n Something went wrong taking screenshots. Printing error... \n"
		);
		console.log(err);
	}

	// save the information in the 'reports' tab as a .csv
	try {
		await saveReport.saveReport(page, directory);
	} catch (err) {
		console.log(
			"\x1b[36m%s\x1b[0m",
			"Something went wrong saving the chart. Printing error... \n"
		);
		console.log(err);
	}

	console.log("\x1b[36m%s\x1b[0m", "all operations completed");
	browser.close();
};

puppeteerConnect(url);
