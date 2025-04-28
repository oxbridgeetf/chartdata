// --- Global Formatting Functions ---
const formatFunctions = {
    Dollar2: value => "$" + value.toFixed(2),
    Dollar0: value => "$" + value.toFixed(0),
    Perc0: value => (value * 100).toFixed(0) + "%",
    Perc2: value => (value * 100).toFixed(2) + "%",
    Perc4: value => (value * 100).toFixed(4) + "%",
    Text: value => value ? value.toString() : "",  // Safely handle undefined or null values
    Dec0: value => value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    Dec2: value => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    Dec4: value => value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
};


// --- Global Table Definitions ---
const tableDefinitions = {
    IOF: {
        tableOptions: {   // <<< 🎯 per-table Tabulator options here
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false,
                //hozAlign: "center",
                //headerHozAlign: "center",
                formatterParams: {
                    style: "font-size: 12px;"
                }
            }
        },
        columns: [
            { title: "ID", field: "ID",  headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Ticker", field: "Ticker", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Base Price", field: "BasePrice", headerSort: false, formatter: cell => formatFunctions.Dollar2(cell.getValue()) },
            { title: "Weight", field: "Weight", headerSort: false, formatter: cell => formatFunctions.Perc2(cell.getValue()) },
            { title: "Index Shares", field: "IndexShares", headerSort: false, formatter: cell => formatFunctions.Dec4(cell.getValue()) },
            { title: "Index Value", field: "IndexValue", headerSort: false, formatter: cell => formatFunctions.Dec4(cell.getValue()) }
        ]
    },
    // more tables can go here later
};

// --- Global loadAssets Function ---
function loadAssets(callback) {
    // Load Montserrat font
    const fontLink = document.createElement('link');
    fontLink.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // Load Tabulator CSS
    const tabulatorCSS = document.createElement('link');
    tabulatorCSS.href = "https://dl.dropbox.com/scl/fi/p7d4q6ytsj3fa6v67x6dg/tabulator-smw.css?rlkey=zobvcfxxdh622appw44ralt2b&st=9kkzb2ve&dl=0";
    tabulatorCSS.rel = "stylesheet";
    document.head.appendChild(tabulatorCSS);

    // Load Tabulator JS
    const tabulatorScript = document.createElement('script');
    tabulatorScript.src = "https://unpkg.com/tabulator-tables@5.3.4/dist/js/tabulator.min.js";
    tabulatorScript.onload = function() {
        console.log("Tabulator loaded.");
        if (typeof callback === "function") {
            callback();
        }
    };
    document.body.appendChild(tabulatorScript);
}

// --- Global loadData Function ---
// Function to load data (either CSV or JSON) and initialize Tabulator table
function loadData(url, containerName, columns) {
    fetch(url)
        .then(response => response.json())  // Get the JSON data
        .then(jsonData => {
            // Log the number of fields in the first record
            const fieldCount = Object.keys(jsonData[0] || {}).length;
            console.log("Number of fields in the first record:", fieldCount);

            // Clean the data by trimming to only the number of fields found in the first record
            const cleanedData = jsonData.map(item => {
                // Get the first `fieldCount` keys from the item
                const trimmedItem = Object.keys(item)
                    .slice(0, fieldCount)  // Get only the first `fieldCount` keys
                    .reduce((result, key) => {
                        result[key] = item[key];  // Add each of those keys and values to the result
                        return result;
                    }, {});

                return trimmedItem;
            });

            console.log("Cleaned Data (trimmed):", cleanedData);  // Log the cleaned data

            // Now that we have the cleaned data, initialize the Tabulator table in the correct container
            new Tabulator(`[data-acc-text='${containerName}']`, {
                data: cleanedData,  // Use the cleaned data
                layout: "fitColumns",  // Fit the columns
                columns: columns  // Use the provided columns definition
            });
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
}




// --- Global initFormattedTable Function ---
// Your existing initFormattedTable function
function initFormattedTable(containerName, tableType, dataOrUrl) {
    const selector = `[data-acc-text='${containerName}']`;
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`Container with accessibility name '${containerName}' not found.`);
        return;
    }

    container.innerHTML = "";  // Clear any existing content

    const tableInfo = tableDefinitions[tableType];
    if (!tableInfo) {
        console.error(`Table type '${tableType}' not defined.`);
        return;
    }

    const tableOptions = {
        columns: tableInfo.columns,
        layout: "fitDataStretch",  // Your layout
        ...(tableInfo.tableOptions || {})
    };

    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        // If passed a URL to a JSON, use the custom loadData function
        loadData(dataOrUrl, containerName, tableInfo.columns);  // Call the new loadData function
    } else {
        // If dataOrUrl is an array, it's normal JS array data
        tableOptions.data = dataOrUrl;
        const table = new Tabulator(container, tableOptions);  // Create the table
    }
}
