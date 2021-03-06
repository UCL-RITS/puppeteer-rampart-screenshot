const fs = require("fs");
const puppeteer = require("puppeteer");
const screenshot = require("./screenshot/screenshot");
const saveReport = require("./screenshot/save_report");

// process arguments
let url = process.argv[2];
if (!url) {
	console.log(
		"No arguments passed to specify url. Defaulting to http://localhost:3000"
	);
	url = "http://localhost:3000";
}

const puppeteerConnect = async (url) => {
	const browser = await puppeteer.launch({
		// headless: false,
		// slowMo: 250,
	});

	const page = await browser.newPage();
	await page.setViewport({ width: 1980, height: 50000 }); // setting large height to account for case where there are many charts

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

	await screenshot.takeScreenshots(page, directory);
	// await saveReport.saveReport(page, directory);
	console.log("All operations completed");

	browser.close();
};

puppeteerConnect(url);
