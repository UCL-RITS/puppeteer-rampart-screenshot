const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const saveReport = async (page, directory, delay) => {
	const openReportTab = async () => {
		// click the report button to open the tab
		const reportButtonElement = await page.$(
			`#root > div > div > div:nth-child(1) > div.buttons > button`
		);
		if (reportButtonElement === null) {
			console.log("No report tab was found");
			return;
		}
		await reportButtonElement.click(); // open the report tab

		// wait for the table content to appear in the dom
		await page.waitForSelector(`#root > div > div > .open > div`);
	};

	const countTables = async () => {
		const tableData = await page.$$(
			`#root > div > div > .open > div > :nth-child(2) > table`
		);
		return tableData.length;
	};

	const getTableHeaderData = async (tableRef) => {
		// get the headers from the first table
		// const tableHeadData = await page.evaluate(() => {
		// 	const thead = Array.from(
		// 		document.querySelectorAll(
		// 			"#root > div > div > div.sc-fzqBZW.ksbfDg.open > div > div.sc-fzqNJr.hSLfNI > table:nth-child(2) > thead > tr > th"
		// 		)
		// 	);
		// 	return thead.map((th) => th.innerText);
		// });

		const tableHeadData = await page.evaluate((tableRef) => {
			const thead = Array.from(
				document.querySelectorAll(`${tableRef} > thead > tr > th`)
			);
			return thead.map((th) => th.innerText);
		}, tableRef);

		// format header data to be inserted into csv
		const csvHeaders = tableHeadData.map((header, index) => {
			return {
				id: index,
				title: header,
			};
		});
		console.log(tableHeadData);
		console.log(csvHeaders);

		return csvHeaders;
	};

	const getTableRowData = async () => {
		// get the rows from the first table
		const tableRowData = await page.evaluate(() => {
			const tbody = Array.from(
				document.querySelectorAll(
					"#root > div > div > div.sc-fzqBZW.ksbfDg.open > div > div.sc-fzqNJr.hSLfNI > table:nth-child(2) > tbody > tr"
				)
			);
			return tbody.map((tr) => tr.innerText);
		});

		// console.log(tableRowData);
		return tableRowData;
	};

	const parseTableData1 = async (tableData) => {
		// extract content from each table row
		const parsedRowData = [];
		tableData.forEach((element) => {
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
		return csvRows;
	};

	const saveTableToCsv = async (csvHeaders, csvRows) => {
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
			.writeRecords(csvRows)
			.then(() => {
				console.log("saved report as .csv");
			})
			.catch((error) => {
				console.error(error);
			});
	};

	await openReportTab();
	const tableCount = await countTables();

	for (let i = 1; i < tableCount + 1; i++) {
		const tableRef = `#root > div > div > .open > div > div:nth-child(2) > table:nth-of-type(${i})`;
		// const element = await page.$(tableRef);

		const csvHeaders = await getTableHeaderData(tableRef);

		// const tableRowData = await getTableRowData();
		// const csvRows = await parseTableData1(tableRowData);
		// await saveTableToCsv(csvHeaders, csvRows);
	}

	// const csvHeaders = await getTableHeaderData();
	// const tableRowData = await getTableRowData();
	// const csvRows = await parseTableData1(tableRowData);
	// await saveTableToCsv(csvHeaders, csvRows);
};

exports.saveReport = saveReport;
