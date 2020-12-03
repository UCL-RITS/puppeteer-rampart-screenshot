const rimraf = require("rimraf");

const puppeteerConnect = require("./src/puppeteer_connect");
const createDirectories = require("./src/create_directories");
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

const runApp = async (url) => {
	const { browser, page } = await puppeteerConnect.puppeteerConnect(url);

	const {
		imagesDirectory,
		reportsDirectory,
		tempImagesDirectory,
	} = await createDirectories.createDirectories();

	// take screenshots of charts
	try {
		await screenshot.takeScreenshots(
			page,
			imagesDirectory,
			tempImagesDirectory
		);
	} catch (err) {
		console.log(
			"\x1b[36m%s\x1b[0m",
			" \n Something went wrong taking screenshots. Printing error... \n"
		);
		console.log(err);
	}

	// save the information in the 'reports' tab as a .csv
	try {
		await saveReport.saveReport(page, reportsDirectory);
	} catch (err) {
		console.log(
			"\x1b[36m%s\x1b[0m",
			"Something went wrong saving the chart. Printing error... \n"
		);
		console.log(err);
	}

	console.log("cleaning up temporary files and folders");
	await rimraf(tempImagesDirectory, function () {
		console.log("\x1b[36m%s\x1b[0m", "all operations completed");
	});

	browser.close();
};

runApp(url);
