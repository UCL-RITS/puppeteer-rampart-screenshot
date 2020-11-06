const puppeteer = require("puppeteer");
const screenshot = require("./screenshot/screenshot");

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
		headless: false,
		//args: ["--window-size=1920,1080"],
	});

	const page = await browser.newPage();
	await page.setViewport({ width: 1980, height: 50000 }); // setting large height to account for case where there are many charts
	//await page._client.send("Emulation.clearDeviceMetricsOverride");

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

	await screenshot.takeScreenshots(page);

	browser.close();
};

puppeteerConnect(url);
