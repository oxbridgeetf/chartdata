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

// --- Global Table Templates ---
const tableTemplates = {
    IOF: {
        columns: [
            { title: "ID", field: "id", formatter: "Text" },
            { title: "Ticker", field: "ticker", formatter: "Text" },
            { title: "Base Price", field: "basePrice", formatter: "Dollar2" },
            { title: "Weight", field: "weight", formatter: "Perc2" },
            { title: "Index Shares", field: "indexShares", formatter: "Dec4" },
            { title: "Index Value", field: "indexValue", formatter: "Dec4" }
        ]
    },
    // More templates can be added here
};

// --- Global loadAssets function ---
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

// --- Global initFormattedTable function ---
function initFormattedTable(containerName, tableType, data) {
    // Build the full selector automatically
    const selector = `[data-acc-text='${containerName}']`;
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`Container with accessibility name '${containerName}' not found.`);
        return;
    }

    // Clear any previous table if reusing container
    container.innerHTML = "";

    const tableInfo = tableDefinitions[tableType];
    if (!tableInfo) {
        console.error(`Table type '${tableType}' not defined.`);
        return;
    }

    const table = new Tabulator(container, {
        data: data,
        columns: tableInfo.columns,
        layout: "fitColumns",
    });
}

