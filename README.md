This project allows users of the RAMPART project [https://github.com/artic-network/rampart](https://github.com/artic-network/rampart) to take automatic screenshots of chart outputs.

---

## Requirements

You need to have Node.js installed on your local machine, this is required to handle npm packages.

https://nodejs.org/en/download/

Once you have cloned this project run the following from the root project directory.

```shell script
npm install
```

This will install all of the project dependencies specified in package.json.

---

## Running the project

In the root project directory run:

```shell script
node app.js
```

The app connects to the default location of running RAMPART projects: [http://localhost:3000](http://localhost:3000).
If your RAMPART project runs from a different location you will need to specify this in the app.js file by modifying the url variable.

---

## Additional Project Notes

The app uses puppeteer [https://github.com/puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) to programatically interact with the browser. This app uses puppeteer to search for charts created by RAMPART and takes a screenshot of each chart.

Chart screenshots are automatically saved as png files in the project root under './images'.

---
