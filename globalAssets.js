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

    // SpecialDate function
    SpecialDate: value => {
        if (!value) return "";  // Return empty if no value

        if (value.includes("/")) {
            // Parse the date and convert it to Mmm Dth (st/rd/th)
            const date = new Date(value);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });

            let suffix = 'th';
            if (day === 1 || day === 21 || day === 31) suffix = 'st';
            if (day === 2 || day === 22) suffix = 'nd';
            if (day === 3 || day === 23) suffix = 'rd';

            return `${month} ${day}${suffix}`;
        } else {
            // Return text if no "/" is found
            return value;
        }
    }
};

// --- Global Table Definitions ---
// This will be dynamically loaded
const tableDefinitions = {};  // Placeholder for dynamic content

// --- Global Assets Loading ---
(function() {
    function loadScript(src) {
        return new Promise(function(resolve, reject) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Load table specifications (including IOF, IndexHeader, etc.)
    loadScript("https://oxbridgeetf.github.io/chartdata/tableSpecs.js").then(() => {
        console.log("tableSpecs.js loaded successfully.");
    }).catch(err => {
        console.error("Failed to load tableSpecs.js:", err);
    });
})();

// Define color palette for consistent use
const colorPalette = {
    highlightYellow: "#FFFF00",   // Yellow for highlighting
    highlightGreen: "#90EE90",    // Light green for success
    highlightRed: "#FF6347",      // Red for errors
    highlightBlue: "#ADD8E6",     // Light blue for informational highlights
    highlightPurple: "#D8BFD8",   // Light purple for soft highlights
    highlightOrange: "#FFA500",   // Orange for attention-grabbing highlights
    Oxford: 'rgb(16,29,62)',
    Cadet: 'rgb(155,184,193)',
    Cinnabar: 'rgb(236, 74, 39)',
    Robin: 'rgb(52,192,206)',
    Persian: 'rgb(198,62,48)',
    Columbia: 'rgb(2203,216,221)',
    Alabaster: 'rgb(229,230,217)',
    Tea: 'rgb(221,232,185)'

    // Add any other colors you need
};

// Export the color palette so it's available globally
window.colorPalette = colorPalette;

// Kill Chart.js and Tabulator cleanly
function destroyChartsAndTables() {
    // 1. Destroy Chart.js instance if it exists
    if (window.chartInstance && typeof window.chartInstance.destroy === 'function') {
        window.chartInstance.destroy();
        window.chartInstance = null;
    }

    // 2. Destroy all Tabulator tables stored in containers with _tabulatorTable
    const containers = document.querySelectorAll('[data-acc-text]');
    containers.forEach(container => {
        if (container._tabulatorTable && typeof container._tabulatorTable.destroy === 'function') {
            container._tabulatorTable.destroy();
            container._tabulatorTable = null;
        }
        container.innerHTML = ""; // Clean up the container
    });

    // 3. Remove the div that holds the canvas (for Chart.js)
    var chartDiv = document.querySelector(".chart-view");
    if (chartDiv && chartDiv.parentNode) {
        chartDiv.parentNode.removeChild(chartDiv);
    }

    console.log("All charts and all Tabulator tables destroyed.");
}

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

    // 🛑 Destroy any existing Tabulator table first
    if (container._tabulatorTable) {
        container._tabulatorTable.destroy();
        container._tabulatorTable = null;
    }

    container.innerHTML = "";  // Clear any existing content

    const tableInfo = tableDefinitions[tableType];
    if (!tableInfo) {
        console.error(`Table type '${tableType}' not defined.`);
        return;
    }

    const tableOptions = {
        ...tableInfo.tableOptions,  // 🔥 FIRST bring in your full table options
        columns: tableInfo.columns, // 🔥 THEN specify columns
    };

    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        loadData(dataOrUrl, containerName, tableInfo.columns);  
    } else {
        tableOptions.data = dataOrUrl;
        const table = new Tabulator(container, tableOptions);  
        container._tabulatorTable = table;  // ✅ Save the table for later destruction
    }
}




/*// --- Global Formatting Functions ---
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

    // SpecialDate function
    SpecialDate: value => {
        if (!value) return "";  // Return empty if no value

        if (value.includes("/")) {
            // Parse the date and convert it to Mmm Dth (st/rd/th)
            const date = new Date(value);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });
            
            let suffix = 'th';
            if (day === 1 || day === 21 || day === 31) suffix = 'st';
            if (day === 2 || day === 22) suffix = 'nd';
            if (day === 3 || day === 23) suffix = 'rd';

            return `${month} ${day}${suffix}`;
        } else {
            // Return text if no "/" is found
            return value;
        }
    }
};

function calFormatter(cell) {
    const value = cell.getValue();
    if (value === "") {
        return "";
    }
    return Math.round(value);
}

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
    IndexHeader: {
        tableOptions: {   // <<< 🎯 per-table Tabulator options here
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false,
                formatterParams: {
                    style: "font-size: 12px;"
                }
            }
        },
        columns: [
            { title: "", field: "Col1", headerSort: false,formatter: cell => formatFunctions.Text(cell.getValue()) }, // No header for Col1
            { title: "", field: "Col2", headerSort: false, formatter: (cell, rowIndex) => {
                // Apply different formatting based on row index
                if (rowIndex === 0) {
                    return formatFunctions.Text(cell.getValue()); // Row 1: plain text
                } else if (rowIndex === 1) {
                    return formatFunctions.SpecialDate(cell.getValue()); // Row 2: SpecialDate
                } else if (rowIndex === 2) {
                    return formatFunctions.Dec4(cell.getValue()); // Row 3: Dec4
                }
                return cell.getValue(); // Default case (though this shouldn't be hit)
            }}
        ]
    },
    "Cal": {
    columns: [
        { title: "", field: "Sun", headerSort: false, hozAlign: "center", formatter: calFormatter },
        { title: "", field: "Mon", headerSort: false, hozAlign: "center", formatter: calFormatter },
        { title: "", field: "Tues", headerSort: false, hozAlign: "center", formatter: calFormatter },
        { title: "", field: "Wed", headerSort: false, hozAlign: "center", formatter: calFormatter },
        { title: "", field: "Thurs", headerSort: false, hozAlign: "center", formatter: calFormatter },
        { title: "", field: "Fri", headerSort: false, hozAlign: "center", formatter: calFormatter },
        { title: "", field: "Sat", headerSort: false, hozAlign: "center", formatter: calFormatter }
    ],
    tableOptions: {
        layout: "fitDataStretch",
        columnDefaults: {
            headerSort: false,
            resizable: false
        }
    }
}

};

// globalAssets.js

// Define color palette for consistent use
const colorPalette = {
    highlightYellow: "#FFFF00",   // Yellow for highlighting
    highlightGreen: "#90EE90",    // Light green for success
    highlightRed: "#FF6347",      // Red for errors
    highlightBlue: "#ADD8E6",     // Light blue for informational highlights
    highlightPurple: "#D8BFD8",   // Light purple for soft highlights
    highlightOrange: "#FFA500",   // Orange for attention-grabbing highlights
    Oxford: 'rgb(16,29,62)',
    Cadet: 'rgb(155,184,193)',
    Cinnabar: 'rgb(236, 74, 39)',
    Robin: 'rgb(52,192,206)',
    Persian: 'rgb(198,62,48)',
    Columbia: 'rgb(2203,216,221)',
    Alabaster: 'rgb(229,230,217)',
    Tea: 'rgb(221,232,185)'

    // Add any other colors you need
};

// Export the color palette so it's available globally
window.colorPalette = colorPalette;


// Kill Chart.js and Tabulator cleanly
function destroyChartsAndTables() {
    // 1. Destroy Chart.js instance if it exists
    if (window.chartInstance && typeof window.chartInstance.destroy === 'function') {
        window.chartInstance.destroy();
        window.chartInstance = null;
    }

    // 2. Destroy all Tabulator tables stored in containers with _tabulatorTable
    const containers = document.querySelectorAll('[data-acc-text]');
    containers.forEach(container => {
        if (container._tabulatorTable && typeof container._tabulatorTable.destroy === 'function') {
            container._tabulatorTable.destroy();
            container._tabulatorTable = null;
        }
        container.innerHTML = ""; // Clean up the container
    });

    // 3. Remove the div that holds the canvas (for Chart.js)
    var chartDiv = document.querySelector(".chart-view");
    if (chartDiv && chartDiv.parentNode) {
        chartDiv.parentNode.removeChild(chartDiv);
    }

    console.log("All charts and all Tabulator tables destroyed.");
}


function highlightRow(table, rowIndex, color = 'highlightYellow', duration = null) {
    const rowComponent = table.getRows()[rowIndex];
    if (!rowComponent) return;

    const highlightColor = window.colorPalette[color] || window.colorPalette.highlightYellow;  // Default to 'highlightYellow' if color is invalid
    
    rowComponent.getElement().style.transition = "background-color 0.5s ease";
    rowComponent.getElement().style.backgroundColor = highlightColor;

    if (duration) {
        setTimeout(() => {
            rowComponent.getElement().style.backgroundColor = "";
        }, duration);
    }
}

function highlightColumn(table, fieldName, color = 'highlightYellow', duration = null) {
    const highlightColor = window.colorPalette[color] || window.colorPalette.highlightYellow;  // Default to 'highlightYellow' if color is invalid
    
    table.getRows().forEach(row => {
        const cell = row.getCell(fieldName);
        if (cell) {
            const el = cell.getElement();
            el.style.transition = "background-color 0.5s ease";
            el.style.backgroundColor = highlightColor;

            if (duration) {
                setTimeout(() => {
                    el.style.backgroundColor = "";
                }, duration);
            }
        }
    });
}

function highlightCell(table, rowIndex, fieldName, color = 'highlightYellow', duration = null) {
    const rowComponent = table.getRows()[rowIndex];
    if (!rowComponent) return;

    const cell = rowComponent.getCell(fieldName);
    if (cell) {
        const highlightColor = window.colorPalette[color] || window.colorPalette.highlightYellow;  // Default to 'highlightYellow' if color is invalid
        const el = cell.getElement();
        el.style.transition = "background-color 0.5s ease";
        el.style.backgroundColor = highlightColor;

        if (duration) {
            setTimeout(() => {
                el.style.backgroundColor = "";
            }, duration);
        }
    }
}


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

            // Initialize the Tabulator table with the cleaned data
            const table = new Tabulator(`[data-acc-text='${containerName}']`, {
                data: cleanedData,  // Use the cleaned data
                layout: "fitColumns",  // Fit the columns
                columns: columns,  // Use the provided columns definition
            });

            // Save the Tabulator instance to the container
            const container = document.querySelector(`[data-acc-text='${containerName}']`);
            if (container) {
                container._tabulatorTable = table;  // Save the table instance
            }
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
    console.log(window.colorPalette);
    // 🛑 Destroy any existing Tabulator table first
    if (container._tabulatorTable) {
        container._tabulatorTable.destroy();
        container._tabulatorTable = null;
    }

    container.innerHTML = "";  // Clear any existing content

    const tableInfo = tableDefinitions[tableType];
    if (!tableInfo) {
        console.error(`Table type '${tableType}' not defined.`);
        return;
    }

    const tableOptions = {
        ...tableInfo.tableOptions,  // 🔥 FIRST bring in your full table options
        columns: tableInfo.columns, // 🔥 THEN specify columns
    };

    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        loadData(dataOrUrl, containerName, tableInfo.columns);  
    } else {
        tableOptions.data = dataOrUrl;
        const table = new Tabulator(container, tableOptions);  
        container._tabulatorTable = table;  // ✅ Save the table for later destruction
    }
}
*/
