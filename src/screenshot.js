const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const takeScreenshots = async (page, directory, delay) => {
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

	const failedScreenshots = [];
	// open all of the tabs containing charts (necessary to take screenshots)
	for (let i = 1; i < foundElementsCount + 1; i++) {
		// get the element containing the button to open the chart tab
		const element = await page.$(
			`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > svg`
		);

		if (element === null) {
			// element will be null if it doesn't contain the button to open the chart tab
			continue;
		}

		// get the name of the current chart tab
		const chartTabName = await page.$(
			`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > span`
		);
		let chartTabNameText = await page.evaluate(
			(element) => element.innerHTML,
			chartTabName
		);

		await element.click(); // open the chart tab
		console.log(`chart tab button ${chartTabNameText} clicked`);

		try {
			console.log("waiting for element to appear in the dom, please wait...");
			await page.waitForSelector(
				`#root > div > div > div:nth-child(${i}) > div > div:nth-child(2)`
			);
		} catch (err) {
			console.log(
				`timeout waiting for tab ${chartTabNameText} to open. Moving on to next chart...` +
					"\n"
			);
			failedScreenshots.push(chartTabNameText);
			continue;
		}

		console.log(
			`Successfully opened chart tab: ${chartTabNameText}, please wait...` +
				"\n"
		);
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
		console.log(`Taking screenshot: ${chartTabGroupNames[i]}, please wait...`);
		const chartTab = await page.$(chartTabGroupElements[i]);

		const appendToImageName = failedScreenshots.includes(chartTabGroupNames[i])
			? "-failed"
			: "";

		await chartTab.screenshot({
			path: `${directory}/${chartTabGroupNames[i]}${appendToImageName}.png`,
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
	if (height > page.viewport().height) {
		console.log(
			`Viewport too small to fit images on screen. You need to increase the viewport height in app.js line 20. Please set the height larger than ${height}`
		);
	}

	// screenshot the entire page (append unique id to name if it already exists in the directory)
	await rootElement.screenshot({
		path: fs.existsSync(`./${directory}/full_page.png`)
			? `${directory}/full_page${uuidv4()}.png`
			: `${directory}/full_page.png`,
		omitBackground: true,
	});
};

exports.takeScreenshots = takeScreenshots;
