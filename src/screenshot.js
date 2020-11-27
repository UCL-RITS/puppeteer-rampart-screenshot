const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Jimp = require("jimp");
const mergeImg = require("merge-img");

const takeScreenshots = async (page, directory, delay, tempFullPageDir) => {
	const getElementText = async (elementRef) => {
		// get the name of the current chart tab
		const elementTextRef = await page.$(elementRef);
		let text = await page.evaluate(
			(element) => element.innerHTML,
			elementTextRef
		);

		return text;
	};

	const countElements = async () => {
		// count how many divs exist in the dom (so we know what to iterate over when opening chart tabs)
		let i = 1;
		let blocksLeftToCount = true;
		while (blocksLeftToCount) {
			const divRef = `#root > div > div > div:nth-child(${i})`;
			const element = await page.$(divRef);

			if (element === null) {
				// element will be null when it finds no more dom elements
				i--; // do this to avoid adding an extra element to the count
				blocksLeftToCount = false;
			}
			i++;
		}
		return i;
	};

	// open all of the tabs containing charts (necessary to take screenshots)
	const openChartTabs = async (domElementCount) => {
		for (let i = 1; i < domElementCount + 1; i++) {
			// a recursive function that will attempt to open the chart tab 2 times if it fails for some reason
			let attempts = 0;
			const openTabAndWait = async () => {
				// get the button to open the tab again (else the node detaches on the second attempt)
				const element = await page.$(tabButtonRef);

				await element.click();
				console.log(`chart tab button ${chartTabNameText} clicked`);

				try {
					console.log(
						"waiting for element to appear in the dom, please wait..."
					);
					await page.waitForSelector(
						`#root > div > div > div:nth-child(${i}) > div > div:nth-child(2)`
					);
					console.log(`Successfully opened chart tab ${chartTabNameText} \n`);
					return true;
				} catch (err) {
					attempts++;
					if (attempts <= 1) {
						console.log(
							`experienced a timeout. Trying to open tab ${chartTabNameText} again`
						);
						await openTabAndWait();
					} else {
						console.log(
							`timeout waiting for tab ${chartTabNameText} to open. Moving on to next chart... \n`
						);
						failedScreenshots.push(chartTabNameText);
						return false;
					}
				}
			};

			const tabButtonRef = `#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > svg`;
			const element = await page.$(tabButtonRef);
			if (element === null) continue; // element will be null if it doesn't contain the button to open the chart tab

			const chartTabNameText = await getElementText(
				`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > span`
			);

			const tabOpened = await openTabAndWait();
			if (tabOpened === false) {
				continue;
			}
		}
	};

	// store references to the elements containing the chart tabs
	// also store the names of the chart tabs
	const storeChartElementRefs = async (domElementCount) => {
		for (let i = 1; i < domElementCount + 1; i++) {
			const element = await page.$(
				`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > svg`
			);

			// element will be null if it doesn't contain the svg button to open the chart tab
			if (element === null) continue;

			const chartTabNameText = await getElementText(
				`#root > div > div > div:nth-child(${i}) > div > div.infoRow > div:nth-child(1) > span`
			);

			// if there are duplicate tab names, append a unique id to the end of the name
			if (
				chartTabGroupNames.includes(chartTabNameText) ||
				fs.existsSync(`./${directory}/${chartTabNameText}.png`)
			) {
				chartTabNameText += `_${uuidv4()}`;
			}

			chartTabGroupNames.push(chartTabNameText);
			chartTabGroupElements.push(
				`#root > div > div > div:nth-child(${i}) > div`
			);
		}
	};

	const takeTabScreenshots = async (
		chartTabGroupElements,
		chartTabGroupNames,
		failedScreenshots
	) => {
		for (let i = 0; i < chartTabGroupElements.length; i++) {
			console.log(
				`Taking screenshot: ${chartTabGroupNames[i]}, please wait...`
			);
			const chartTab = await page.$(chartTabGroupElements[i]);

			// append 'failed' to image name if the chart tab failed to open
			const appendToImageName = failedScreenshots.includes(
				chartTabGroupNames[i]
			)
				? "-failed"
				: "";

			await chartTab.screenshot({
				path: `${directory}/${chartTabGroupNames[i]}${appendToImageName}.png`,
				omitBackground: true,
			});
		}
	};

	const takeHeaderScreenshot = async () => {
		// screenshot the top header
		const topHeader = await page.$("#root > div > div > div");
		await topHeader.screenshot({
			path: fs.existsSync(`./${directory}/top_header.png`)
				? `${directory}/top_header${uuidv4()}.png`
				: `${directory}/top_header.png`,
			omitBackground: true,
		});

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
	};

	const scrollDown = async () => {
		const isEnd = await page.evaluate(() => {
			window.scrollBy(0, window.innerHeight);
			return window.scrollY >= document.body.clientHeight - window.innerHeight;
		});
		return isEnd;
	};

	const takeFullpageScreenshot = async () => {
		console.log("\n Taking full page screenshot, please wait...");
		try {
			const {
				pagesCount,
				extraPixels,
				viewport,
				clientHeight,
				innerHeight,
			} = await page.evaluate(() => {
				window.scrollTo(0, 0);
				return {
					pagesCount: Math.ceil(
						document.body.clientHeight / window.innerHeight
					),
					extraPixels: document.body.clientHeight % window.innerHeight,
					viewport: {
						height: window.innerHeight,
						width: window.innerWidth,
					},
					clientHeight: document.body.clientHeight,
					innerHeight: window.innerHeight,
				};
			});
			// console.log(
			// 	`pages count: ${pagesCount}, \n extra pixels: ${extraPixels}, \n viewport width: ${viewport.width}, viewport height: ${viewport.height}, \n client height: ${clientHeight}, \n inner height: ${innerHeight} `
			// );

			const images = [];
			for (let i = 0; i < pagesCount; i += 1) {
				const image = await page.screenshot({
					path: `./${tempFullPageDir}/temp_${i}.png`,
				});
				await scrollDown();
				images.push(image);
			}

			if (pagesCount === 1) {
				const image = await Jimp.read(images[0]);
				image.write(`./${directory}/full_page_screenshot.png`, () => {
					console.log("successfully took full page screenshot");
				});
				return;
			}

			// crop the last image so that we can append it to the end of the full page png
			const cropped = await Jimp.read(images.pop())
				.then((image) =>
					image.crop(
						0,
						viewport.height - extraPixels - 16,
						viewport.width,
						extraPixels
					)
				)
				.then((image) => image.getBufferAsync(Jimp.AUTO));
			images.push(cropped);
			const mergedImage = await (0, mergeImg)(images, {
				direction: true,
			});
			await mergedImage.write(`./${directory}/full_page_jimp.png`);
			console.log("successfully took full page screenshot");
		} catch (err) {
			console.log(
				"something went wrong taking the full page screenshot, printing error... \n " +
					err
			);
		}
	};

	const getViewport = async () => {
		// detect the size of the page when all chart tabs are open so we can take a full page screenshot
		const rootElement = await page.$("#root");
		const boundingBox = await rootElement.boundingBox();
		const { width, height } = boundingBox;
		return boundingBox;
	};

	const setViewport = async (viewport) => {
		console.log(viewport);
		// commented out setViewport as the chart tabs get closed when changing the viewport size (this is an issue with RAMPART not this app)
		//await page.setViewport({ width: viewport.width, height: viewport.height });
	};

	const chartTabGroupElements = []; // stores the chart tab dom elements
	const chartTabGroupNames = []; // stores the name of each chart tab
	const failedScreenshots = []; // stores the names of any charts that failed to screenshot

	const domElementCount = await countElements();
	await openChartTabs(domElementCount);
	await storeChartElementRefs(domElementCount);

	await takeTabScreenshots(
		chartTabGroupElements,
		chartTabGroupNames,
		failedScreenshots
	);
	await takeHeaderScreenshot();
	const viewport = await getViewport();
	await setViewport(viewport);
	await takeFullpageScreenshot();
};

exports.takeScreenshots = takeScreenshots;
