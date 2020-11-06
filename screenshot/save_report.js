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

	const tableData = await page.evaluate(() => {
		const thead = Array.from(
			document.querySelectorAll(
				"#root > div > div > div.sc-fzqBZW.ksbfDg.open > div > div.sc-fzqNJr.hSLfNI > table:nth-child(2) > thead > tr > th"
			)
		);
		return thead.map((th) => th.innerText);
	});

	console.log(tableData);
};

exports.saveReport = saveReport;
