// --- Global Formatting Functions ---
const formatFunctions = {
Dollar2: value => "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
Dollar0: value => {
    const formatted = "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    console.log(`Dollar0 formatted: input=${value}, output=${formatted}`);
    return formatted;
},
Dollar4: value => "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
    Perc0: value => (value * 100).toFixed(0) + "%",
    Perc2: value => (value * 100).toFixed(2) + "%",
    Perc4: value => (value * 100).toFixed(4) + "%",
    Text: value => value ? value.toString() : "",  // Safely handle undefined or null values
    TextTest: value => (value || "").toString() + "*",  // Safely handle undefined or null values
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

// --- Global loadData Function ---
// Function to load data (either CSV or JSON) and initialize Tabulator table
function loadData(url, containerName, columns, col2FormatArray = null) {
    fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            const fieldCount = Object.keys(jsonData[0] || {}).length;
            console.log("Number of fields in the first record:", fieldCount);

            const cleanedData = jsonData.map(item => {
                const trimmedItem = Object.keys(item)
                    .slice(0, fieldCount)
                    .reduce((result, key) => {
                        result[key] = item[key];
                        return result;
                    }, {});
                return trimmedItem;
            });

            console.log("Cleaned Data (trimmed):", cleanedData);

            const container = document.querySelector(`[data-acc-text='${containerName}']`);
            if (!container) {
                console.error(`Container '${containerName}' not found.`);
                return;
            }

            // Retrieve the stored tableType
            const tableType = container.dataset.tableType;

            const tableInfo = tableDefinitions[tableType];
            if (!tableInfo) {
                console.error(`Table type '${tableType}' not defined.`);
                return;
            }

            const tableOptions = {
                ...tableInfo.tableOptions,
                data: cleanedData,
                columns: columns,
            };

            const table = new Tabulator(container, tableOptions);

            // Handle col2FormatArray
            if (tableType === "TwoColCustom") {
                // Use col2FormatArray passed to loadData or stored in container
                table._col2FormatArray = col2FormatArray || container._col2FormatArray || [];
            }

            container._tabulatorTable = table;
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
}


// --- Global initFormattedTable Function ---
function initFormattedTable(containerName, tableType, dataOrUrl, col2FormatArray = null, columnHeaders = null) {
    const selector = `[data-acc-text='${containerName}']`;
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`Container with accessibility name '${containerName}' not found.`);
        return;
    }

    if (container._tabulatorTable) {
        container._tabulatorTable.destroy();
        container._tabulatorTable = null;
    }

    container.innerHTML = "";

    const tableInfo = tableDefinitions[tableType];
    if (!tableInfo) {
        console.error(`Table type '${tableType}' not defined.`);
        return;
    }

    // Clone base columns so we don't mutate the original definition
    let finalColumns = [...tableInfo.columns];

     if (
        (tableType === "MC2" || tableType.startsWith("JustText") || tableType === "TwoColCustom") &&
        Array.isArray(columnHeaders) &&
        columnHeaders.length === finalColumns.length
    ) {
        console.log("Applying custom column headers:", columnHeaders);
        finalColumns = finalColumns.map((col, idx) => ({
            ...col,
            title: columnHeaders[idx],
        }));
    }

    // Apply col2FormatArray to override column formatters
    if (Array.isArray(col2FormatArray) && col2FormatArray.length === finalColumns.length) {
        finalColumns = finalColumns.map((col, idx) => {
            const formatType = col2FormatArray[idx];
            if (formatType && formatFunctions[formatType]) {
                return {
                    ...col,
                    formatter: formatFunctions[formatType],
                };
            }
            return col; // Use default formatter if no override
        });
    }

    const tableOptions = {
        ...tableInfo.tableOptions,
        columns: finalColumns,
    };

    if (Array.isArray(col2FormatArray)) {
        container._col2FormatArray = col2FormatArray;
    }

    container.dataset.tableType = tableType;
    console.log("Final Columns Before Tabulator Initialization:", finalColumns);
    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        loadData(dataOrUrl, containerName, finalColumns);  
    } else {
        tableOptions.data = dataOrUrl;
        const table = new Tabulator(container, tableOptions);

        // Store col2FormatArray in the table for use in custom behavior
        if (Array.isArray(col2FormatArray)) {
            table._col2FormatArray = col2FormatArray;
        }

        container._tabulatorTable = table;
    }
}

/**
 * Build a generic table from scratch in the specified container.
 * 
 * @param {string} containerName - The name of the container where the table will be rendered.
 * @param {Array|String} dataOrUrl - The JSON data to populate the table or a URL to fetch the data from.
 * @param {Array|null} columnFormatVector - An optional array of formatters for each column. Defaults to "Text" for all columns.
 * @param {Array|null} columnHeaderVector - An optional array of column headers for each column. Defaults to empty strings for all columns.
 */
function initDynamicFormattedTable(containerName, dataOrUrl, ColumnNames, FormatArray, columnHeaders = null) {
    const selector = `[data-acc-text='${containerName}']`;
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`Container with accessibility name '${containerName}' not found.`);
        return;
    }

    if (container._tabulatorTable) {
        container._tabulatorTable.destroy();
        container._tabulatorTable = null;
    }

    container.innerHTML = "";

    // Ensure ColumnNames and FormatArray are arrays of equal length
    if (!Array.isArray(ColumnNames) || !Array.isArray(FormatArray) || ColumnNames.length !== FormatArray.length) {
        console.error("ColumnNames and FormatArray must be arrays of the same length.");
        return;
    }

    // Dynamically create column definitions
    let finalColumns = ColumnNames.map((colName, idx) => {
        const formatType = FormatArray[idx];
        const formatterFn = formatFunctions[formatType] || formatFunctions.Text; // Default to 'Text' if format is not found
        return {
            title: "", // Default title, overridden later if columnHeaders is provided
            field: colName,
            formatter: formatterFn,
            headerSort: false, // Disable sorting by default
        };
    });

    // Apply custom column headers if provided
    if (Array.isArray(columnHeaders) && columnHeaders.length === finalColumns.length) {
        console.log("Applying custom column headers:", columnHeaders);
        finalColumns = finalColumns.map((col, idx) => ({
            ...col,
            title: columnHeaders[idx],
        }));
    } else {
        console.log("Using default column titles.");
    }

    // Preprocess data to ensure text is treated as strings and numbers as numbers
    const preprocessData = (data, ColumnNames, FormatArray) => {
        return data.map((row) => {
            let processedRow = {};

            ColumnNames.forEach((col, idx) => {
                const formatType = FormatArray[idx];
                const value = row[col];

                switch (formatType) {
                    case "Text":
                        // Ensure the value is a string
                        processedRow[col] = value != null ? value.toString() : "";
                        break;

                    case "Dollar2":
                    case "Dec0":
                        // Ensure the value is a number
                        const numericValue = parseFloat(value);
                        processedRow[col] = isNaN(numericValue) ? 0 : numericValue;
                        break;

                    default:
                        // Pass through for other types or unrecognized formatters
                        processedRow[col] = value;
                        break;
                }
            });

            return processedRow;
        });
    };

    // Process dataOrUrl
    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        fetch(dataOrUrl)
            .then((response) => response.json())
            .then((jsonData) => {
                console.log("Raw JSON Data:", jsonData);

                // Preprocess the JSON data
                const processedData = preprocessData(jsonData, ColumnNames, FormatArray);
                console.log("Processed Data for Table:", processedData);

                const tableOptions = {
                    layout: "fitColumns",
                    data: processedData,
                    columns: finalColumns,
                };

                const table = new Tabulator(container, tableOptions);
                container._tabulatorTable = table;
            })
            .catch((error) => console.error("Error fetching JSON file:", error));
    } else if (Array.isArray(dataOrUrl)) {
        // Preprocess the supplied JSON data
        const processedData = preprocessData(dataOrUrl, ColumnNames, FormatArray);
        console.log("Processed Data for Table:", processedData);

        const tableOptions = {
            layout: "fitColumns",
            data: processedData,
            columns: finalColumns,
        };

        const table = new Tabulator(container, tableOptions);
        container._tabulatorTable = table;
    } else {
        console.error("Invalid dataOrUrl parameter. Must be a JSON array or a URL to a .json file.");
    }
}
