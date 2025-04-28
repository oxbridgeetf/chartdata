// --- Global Formatting Functions ---
const formatFunctions = {
    Dollar2: value => "$" + value.toFixed(2),
    Dollar0: value => "$" + value.toFixed(0),
    Perc0: value => (value * 100).toFixed(0) + "%",
    Perc2: value => (value * 100).toFixed(2) + "%",
    Perc4: value => (value * 100).toFixed(4) + "%",
    Text: value => value.toString(),
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
            { title: "ID", field: "id", formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Ticker", field: "ticker", formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Base Price", field: "basePrice", formatter: cell => formatFunctions.Dollar2(cell.getValue()) },
            { title: "Weight", field: "weight", formatter: cell => formatFunctions.Perc2(cell.getValue()) },
            { title: "Index Shares", field: "indexShares", formatter: cell => formatFunctions.Dec4(cell.getValue()) },
            { title: "Index Value", field: "indexValue", formatter: cell => formatFunctions.Dec4(cell.getValue()) }
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

// --- Global initFormattedTable Function ---
function initFormattedTable(containerName, tableType, dataOrUrl) {
    const selector = `[data-acc-text='${containerName}']`;
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`Container with accessibility name '${containerName}' not found.`);
        return;
    }

    container.innerHTML = "";

    const tableInfo = tableDefinitions[tableType];
    if (!tableInfo) {
        console.error(`Table type '${tableType}' not defined.`);
        return;
    }

    const tableOptions = {
        columns: tableInfo.columns,
        layout: "fitDataStretch",
        ...(tableInfo.tableOptions || {})
    };

    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".csv")) {
        // If passed a URL to a CSV
        tableOptions.ajaxURL = dataOrUrl;
        tableOptions.ajaxConfig = "GET";
        tableOptions.ajaxContentType = "text/csv";  // Important for Dropbox-style links
        tableOptions.ajaxResponse = function(url, params, response) {
            // Tabulator can parse CSV automatically if you just return the raw CSV string
            return response; 
        };
        tableOptions.dataLoader = true; // Show spinner while loading
        tableOptions.dataLoaderLoading = "Loading table...";
    } else {
        // Passed a normal JS array
        tableOptions.data = dataOrUrl;
    }

    const table = new Tabulator(container, tableOptions);
}


