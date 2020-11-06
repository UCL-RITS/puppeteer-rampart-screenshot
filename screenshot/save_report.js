const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const saveReport = async (page) => {
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

	// get the headers from the first table
	const tableHeadData = await page.evaluate(() => {
		const thead = Array.from(
			document.querySelectorAll(
				"#root > div > div > div.sc-fzqBZW.ksbfDg.open > div > div.sc-fzqNJr.hSLfNI > table:nth-child(2) > thead > tr > th"
			)
		);
		return thead.map((th) => th.innerText);
	});
	console.log(tableHeadData);

	// get the rows from the first table
	const tableRowData = await page.evaluate(() => {
		const tbody = Array.from(
			document.querySelectorAll(
				"#root > div > div > div.sc-fzqBZW.ksbfDg.open > div > div.sc-fzqNJr.hSLfNI > table:nth-child(2) > tbody > tr > th"
			)
		);
		return tbody.map((tr) => tr.innerText);
	});
	console.log(tableRowData);

	// write data to csv (currently experimenting)
	const csvWriter = createCsvWriter({
		path: "file.csv",
		header: [
			{ id: "1", title: tableHeadData[0] },
			{ id: "2", title: tableHeadData[1] },
			{ id: "3", title: tableHeadData[2] },
			{ id: "4", title: tableHeadData[3] },
			{ id: "5", title: tableHeadData[4] },
			{ id: "6", title: tableHeadData[5] },
		],
	});

	const records = [
		{ 1: "test1", 2: "test2", 3: "test3", 4: "test4", 5: "test5", 6: "test6" },
		{ 1: "test1", 2: "test2", 3: "test3", 4: "test4", 5: "test5", 6: "test6" },
	];

	csvWriter
		.writeRecords(records) // returns a promise
		.then(() => {
			console.log("...Done");
		});
};

exports.saveReport = saveReport;
