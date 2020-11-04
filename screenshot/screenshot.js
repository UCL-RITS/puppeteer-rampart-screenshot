const puppeteer = require("puppeteer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const takeScreenshots = async (url) => {
	const browser = await puppeteer.launch({
		headless: true,
	});
	const page = await browser.newPage();
	await page.setViewport({ width: 1980, height: 30000 }); // setting large height to account for case where there are many charts

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

	const directory = `./images/${
		year + "-" + month + "-" + date + "-" + timeStamp
	}`;
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}

	// count how many divs are clickable buttons (to open the chart tabs)
	let i = 1;
	let blocksLeftToCount = true;
	while (blocksLeftToCount) {
		const element = await page.$(`#root > div > div > div:nth-child(${i})`);

		if (element === null) {
			// element will be null when it finds no more dom elements
			i--; // do this to avoid adding an extra element to the count
			blocksLeftToCount = false;
		}
		i++;
	}
	const foundElementsCount = i;

	// open all of the tabs containing charts (necessary to take screenshots)
	for (let i = 1; i < foundElementsCount + 1; i++) {
		const element = await page.$(
			`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > svg`
		);

		if (element === null) {
			// element will be null if it doesn't contain the button to open the chart tab
			continue;
		}
		await element.click(); // open the chart tab and wait for the element to appear in the dom
		await page.waitForSelector(
			`#root > div > div > div:nth-child(${i}) > div > div:nth-child(2)`
		);
		console.log("Performing operation, please wait...");
	}

	// store an array of elements pointing towards the tabs containing charts, also store the tab names
	let chartTabGroupElements = [];
	let chartTabGroupNames = [];
	for (let i = 1; i < foundElementsCount + 1; i++) {
		const element = await page.$(
			`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > svg`
		);

		if (element === null) {
			// element will be null if it doesn't contain the svg button to open the chart tab
			continue;
		}

		const chartTabName = await page.$(
			`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > span`
		);
		let chartTabNameText = await page.evaluate(
			(element) => element.innerHTML,
			chartTabName
		);

		// if there are duplicate tab names, append a unique id to the end of the name
		if (
			chartTabGroupNames.includes(chartTabNameText) ||
			fs.existsSync(`./${directory}/${chartTabNameText}.png`)
		) {
			chartTabNameText += `_${uuidv4()}`;
		}

		chartTabGroupNames.push(chartTabNameText);
		chartTabGroupElements.push(`#root > div > div > div:nth-child(${i}) > div`);
	}

	// screenshot each tab containing charts
	for (let i = 0; i < chartTabGroupElements.length; i++) {
		const chartTab = await page.$(chartTabGroupElements[i]);
		await chartTab.screenshot({
			path: `${directory}/${chartTabGroupNames[i]}.png`,
			omitBackground: true,
		});
	}

	// screenshot the first set of charts in the top header (append unique id to name if it already exists in the directory)
	const headerCharts = await page.$(
		"#root > div > div > div:nth-child(2) > div"
	);
	await headerCharts.screenshot({
		path: fs.existsSync(`./${directory}/header_charts.png`)
			? `${directory}/header_charts_${uuidv4()}.png`
			: `${directory}/header_charts.png`,
		omitBackground: true,
	});

	// screenshot the top header
	const topHeader = await page.$("#root > div > div > div");
	await topHeader.screenshot({
		path: fs.existsSync(`./${directory}/top_header.png`)
			? `${directory}/top_header${uuidv4()}.png`
			: `${directory}/top_header.png`,
		omitBackground: true,
	});

	// detect the size of the page when all chart tabs are open so we can take a full page screenshot
	// commented out setViewport as the chart tabs get closed when changing the viewport size (this is an issue with RAMPART not this app)
	const rootElement = await page.$("#root");
	const boundingBox = await rootElement.boundingBox();
	const { width, height } = boundingBox;
	// await page.setViewport({ width: width, height: height });

	// screenshot the entire page (append unique id to name if it already exists in the directory)
	await rootElement.screenshot({
		path: fs.existsSync(`./${directory}/full_page.png`)
			? `${directory}/full_page${uuidv4()}.png`
			: `${directory}/full_page.png`,
		omitBackground: true,
	});

	browser.close();
};

exports.takeScreenshots = takeScreenshots;