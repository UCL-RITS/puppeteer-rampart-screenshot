const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const saveReport = async (page) => {
	console.log("save report");

	const reportButtonElement = await page.$(
		`#root > div > div > div.sc-AxirZ.aHDei > div.buttons > button`
	);

	if (reportButtonElement === null) {
		console.log("No report tab was found");
		return;
	}

	await reportButtonElement.click(); // open the report tab

	await page.waitForSelector(
		`#root > div > div > div.sc-fzqBZW.ksbfDg.open > div`
	);
};

exports.saveReport = saveReport;
