const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const saveReport = async (page, directory, delay) => {
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

	// format header data to be inserted into csv
	const csvHeaders = tableHeadData.map((header, index) => {
		return {
			id: index,
			title: header,
		};
	});
	console.log(tableHeadData);
	console.log(csvHeaders);

	// get the rows from the first table
	const tableRowData = await page.evaluate(() => {
		const tbody = Array.from(
			document.querySelectorAll(
				"#root > div > div > div.sc-fzqBZW.ksbfDg.open > div > div.sc-fzqNJr.hSLfNI > table:nth-child(2) > tbody > tr"
			)
		);
		return tbody.map((tr) => tr.innerText);
	});
	//console.log(tableRowData);

	// extract content from each table row
	const parsedRowData = [];
	tableRowData.forEach((element) => {
		const splitRow = element.split("\t");
		parsedRowData.push(splitRow);
	});
	console.log(parsedRowData);

	const csvRows = [];
	parsedRowData.map((row) => {
		let obj = {};
		row.map((inner, index) => {
			obj[index] = inner;
		});
		csvRows.push(obj);
	});
	console.log(csvRows);

	// write data to csv
	const csvWriter = createCsvWriter({
		path: `${directory}/report.csv`,
		header: csvHeaders,
	});

	// const csvRows = [
	// 	{ 1: "test1", 2: "test2", 3: "test3", 4: "test4", 5: "test5", 6: "test6" },
	// 	{ 1: "test1", 2: "test2", 3: "test3", 4: "test4", 5: "test5", 6: "test6" },
	// ];

	await csvWriter
		.writeRecords(csvRows) // returns a promise
		.then(() => {
			console.log("saved report as .csv");
		})
		.catch((error) => {
			console.error(error);
		});
};

exports.saveReport = saveReport;
