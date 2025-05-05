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
    TextTest: value => value.toString() + "*" ? value.toString() : "",  // Safely handle undefined or null values
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
function loadData(url, containerName, columns) {
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

            // 💡 Add col2FormatArray support here for TwoColCustom
            if (tableType === "TwoColCustom" && Array.isArray(container._col2FormatArray)) {
                table._col2FormatArray = container._col2FormatArray;
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

    // Apply custom column headers if provided
    if (
        (tableType === "MC2" || tableType.startsWith("JustText")) &&
        Array.isArray(columnHeaders) &&
        columnHeaders.length === finalColumns.length
    ) {
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

    container.dataset.tableType = tableType;

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

function buildGenericTable(containerName, dataOrUrl, columnFormatVector = null, columnHeaderVector = null) {
    const selector = `[data-acc-text='${containerName}']`;
    const container = document.querySelector(selector);

    // Check if container exists
    if (!container) {
        console.error(`Container with accessibility name '${containerName}' not found.`);
        return;
    }

    // Destroy any existing table in the container
    if (container._tabulatorTable) {
        container._tabulatorTable.destroy();
        container._tabulatorTable = null;
    }

    container.innerHTML = "";

    // Function to initialize the table once data is ready
    function initializeTable(jsonData) {
        // Determine the number of columns based on the first row of data
        const numColumns = jsonData.length > 0 ? Object.keys(jsonData[0]).length : 0;

        // Default columnFormatVector to "Text" for all columns if not provided
        const effectiveColumnFormatVector = columnFormatVector || Array(numColumns).fill("Text");

        // Default columnHeaderVector to empty strings for all columns if not provided
        const effectiveColumnHeaderVector = columnHeaderVector || Array(numColumns).fill("");

        // Validate input lengths
        if (effectiveColumnFormatVector.length !== effectiveColumnHeaderVector.length) {
            console.error("Column format vector and column header vector must have the same length.");
            return;
        }

        // Build columns dynamically
        const columns = effectiveColumnHeaderVector.map((header, index) => {
            const formatType = effectiveColumnFormatVector[index];
            const formatter = formatFunctions[formatType] || formatFunctions.Text; // Default to Text formatter if not found
            return {
                title: header,
                field: `Col${index + 1}`, // Generic field names like Col1, Col2, etc.
                formatter: formatter,
                headerSort: false,
            };
        });

        // Clean and format the data
        const cleanedData = jsonData.map((row) => {
            const formattedRow = {};
            Object.keys(row).forEach((key, colIndex) => {
                const columnKey = `Col${colIndex + 1}`;
                formattedRow[columnKey] = row[key];
            });
            return formattedRow;
        });

        // Initialize the Tabulator table
        const table = new Tabulator(container, {
            data: cleanedData,
            columns: columns,
            layout: "fitColumns", // Adjust column layout to fit the table width
            columnDefaults: {
                headerSort: false, // Disable column sorting by default
            },
        });

        // Store the table instance in the container for later reference
        container._tabulatorTable = table;
    }

    // Handle data input (either URL or direct JSON data)
    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        // Fetch data from the URL
        fetch(dataOrUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data from URL: ${dataOrUrl}`);
                }
                return response.json();
            })
            .then((jsonData) => {
                initializeTable(jsonData);
            })
            .catch((error) => {
                console.error("Error loading data:", error);
            });
    } else if (Array.isArray(dataOrUrl)) {
        // Directly use the provided JSON data
        initializeTable(dataOrUrl);
    } else {
        console.error("Invalid dataOrUrl. Must be a JSON array or a valid URL ending in '.json'.");
    }
}
