// --- Global Formatting Functions ---
const formatFunctions = {
    Dollar2: value => "$" + value.toFixed(2),
    Dollar0: value => "$" + value.toFixed(0),
    Dollar4: value => "$" + value.toFixed(4),
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
    tabulatorCSS.href = "https://dl.dropbox.com/scl/fi/uqsuqdgvq4mwkq7hk82jg/tabulator-smw-scale.css?rlkey=8og692zpth7g4v5rb3wftmzw6&st=9uakunqi&dl=0";
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
            if (container) {
                const rect = container.getBoundingClientRect();
                console.log(`Container Rect:`, rect);

                container.style.height = `${rect.height}px`; // Ensuring container has the correct height

                const numberOfRows = cleanedData.length;
                console.log("Number of Rows:", numberOfRows);

                let rowHeight = 0;
                if (numberOfRows > 0) {
                    const availableHeight = rect.height;
                    rowHeight = Math.floor(availableHeight / numberOfRows);
                }

                console.log(`Calculated rowHeight: ${rowHeight}px for ${numberOfRows} rows`);

                // If rowHeight is too small (less than 20px), default to 20px
                rowHeight = Math.max(20, rowHeight);
                console.log(`Adjusted Row Height: ${rowHeight}px`);

                // Initialize Tabulator table with updated height and row height
               const table = new Tabulator(container, {
    data: cleanedData,
    layout: "fitColumns",
    columns: columns,
    rowHeight: rowHeight,               // Dynamically calculated row height
    height: rect.height,                // Match the container height exactly
    maxHeight: rect.height,             // Prevent overflow beyond the container
    pagination: false,                  // Disable pagination so all rows are visible
    movableColumns: true,               // Allow users to move columns
    resizableRows: false,               // Disable row resizing for layout consistency

    renderComplete: function () {
        console.log("✅ Table has been built.");
        console.log("Final Table Options:", this.options);
        console.log("📏 Calculated Row Height:", rowHeight);
        console.log("📄 Number of Rows Provided:", cleanedData.length);
        console.log("👁️ Number of Displayed Rows:", this.rowManager.getDisplayRows().length);
        console.log("📐 Actual Table Height in DOM:", this.element.offsetHeight);
        console.log("🧱 Container Offset Height:", container.offsetHeight);
        console.log("🧱 Container Scroll Height:", container.scrollHeight);
        console.log("🧱 Container Client Height:", container.clientHeight);
        console.log("🧾 Rendered Row Data:", this.rowManager.getDisplayRows().map(r => r.getData()));
    }
});


                container._tabulatorTable = table;
            } else {
                console.error("Container not found.");
            }
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
}



// --- Global initFormattedTable Function ---
// Function to initialize formatted tables
// --- Global initFormattedTable Function ---
function initFormattedTable(containerName, tableType, dataOrUrl, col2FormatArray = null) {
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
        ...tableInfo.tableOptions,
        columns: tableInfo.columns,
    };

    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        loadData(dataOrUrl, containerName, tableInfo.columns);  
    } else {
        tableOptions.data = dataOrUrl;
        const table = new Tabulator(container, tableOptions);

        // ✅ Inject the format array if specified and this is TwoColCustom
        if (tableType === "TwoColCustom" && Array.isArray(col2FormatArray)) {
            table._col2FormatArray = col2FormatArray;
        }

        // Ensure the container uses the actual size of rect1, rect2, etc.
        const rect = container.getBoundingClientRect();
        container.style.width = `${rect.width}px`;
        container.style.height = `${rect.height}px`;

        console.log("Container Size (width x height):", rect.width, rect.height); // Debugging

        // Calculate row height dynamically based on the available container height and number of rows
        const numberOfRows = tableOptions.data.length;
        console.log("Number of Rows:", numberOfRows); // Debugging
        if (numberOfRows > 0) {
            const availableHeight = rect.height; // Container's available height
            const rowHeight = availableHeight / numberOfRows; // Divide by the number of rows
            console.log("Calculated Row Height:", rowHeight); // Debugging

            // Set the row height, ensure it's at least 20px
            const table = new Tabulator(container, {
                    data: cleanedData,
                    layout: "fitColumns",
                    columns: columns,
                    rowHeight: Math.max(20, rowHeight), // Ensure the row height is at least 20px
                    height: rect.height, // Set the total height of the table
            });
        }

        // Manually trigger a redraw of the table to ensure proper sizing
        setTimeout(() => {
            if (table && typeof table.redraw === "function") {
                table.redraw(true);
            }
        }, 100); // Delay to ensure DOM has been updated

        // Add resize event listener specifically for this table's container
        const resizeHandler = () => {
            const rect = container.getBoundingClientRect();
            container.style.width = `${rect.width}px`;
            container.style.height = `${rect.height}px`;
            if (table && typeof table.redraw === "function") {
                table.redraw(true);
            }
        };

        // Attach the resize listener to the specific container
        window.addEventListener("resize", resizeHandler);

        // Clean up the event listener when the table is destroyed
        container._resizeHandler = resizeHandler;
    }
}

// Additional cleanup when the window is unloaded
window.addEventListener("unload", function() {
    if (window._resizeHandler) {
        window.removeEventListener("resize", window._resizeHandler);
    }
});
