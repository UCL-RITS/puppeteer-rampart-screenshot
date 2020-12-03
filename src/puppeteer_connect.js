const puppeteer = require("puppeteer");

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

	return { browser: browser, page: page };
};

exports.puppeteerConnect = puppeteerConnect;
