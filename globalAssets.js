// --- Import Colors and Formats ---
import { formatFunctions, colorPalette } from './colorsAndFormats.js';

// --- Global Table Definitions ---
// This will be dynamically loaded

// --- Global Assets Loading Function ---
function loadAssets(assets, callback) {
    const promises = assets.map(asset => {
        return new Promise((resolve, reject) => {
            let element;

            if (asset.type === "script") {
                // Create a script element
                element = document.createElement('script');
                element.src = asset.src;
                element.async = asset.async || true;
            } else if (asset.type === "stylesheet") {
                // Create a link element for CSS
                element = document.createElement('link');
                element.href = asset.src;
                element.rel = "stylesheet";
            } else if (asset.type === "font") {
                // Create a link element for fonts
                element = document.createElement('link');
                element.href = asset.src;
                element.rel = "stylesheet";
            } else {
                console.error(`Unknown asset type: ${asset.type}`);
                return reject(`Unknown asset type: ${asset.type}`);
            }

            // Attach event listeners
            element.onload = () => {
                console.log(`Loaded: ${asset.src}`);
                resolve();
            };
            element.onerror = () => {
                console.error(`Failed to load: ${asset.src}`);
                reject(`Failed to load: ${asset.src}`);
            };

            // Append the element to the appropriate location
            if (asset.type === "script") {
                document.body.appendChild(element);
            } else {
                document.head.appendChild(element);
            }
        });
    });

    // Wait for all assets to load, then execute the callback
    Promise.all(promises)
        .then(() => {
            console.log("All assets loaded.");
            if (typeof callback === "function") {
                callback();
            }
        })
        .catch(error => console.error("Error loading assets:", error));
}

// --- Usage Example ---
loadAssets([
    { type: "font", src: "https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap" },
    { type: "stylesheet", src: "https://dl.dropbox.com/scl/fi/p7d4q6ytsj3fa6v67x6dg/tabulator-smw.css?rlkey=zobvcfxxdh622appw44ralt2b&st=9kkzb2ve&dl=0" },
    { type: "script", src: "https://unpkg.com/tabulator-tables@5.3.4/dist/js/tabulator.min.js" },
    { type: "script", src: "https://oxbridgeetf.github.io/chartdata/tableSpecs.js" }
], () => {
    console.log("All assets are ready to use.");
});

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

    // ✳️ If MC2 and custom headers provided, replace titles
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

    const tableOptions = {
        ...tableInfo.tableOptions,
        columns: finalColumns,
    };

    // 🔹 Add this line to make tableType accessible in loadData
    container.dataset.tableType = tableType;

    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        loadData(dataOrUrl, containerName, finalColumns);  
    } else {
        tableOptions.data = dataOrUrl;
        const table = new Tabulator(container, tableOptions);

        if (tableType === "TwoColCustom" && Array.isArray(col2FormatArray)) {
            table._col2FormatArray = col2FormatArray;
        }

        container._tabulatorTable = table;
    }
}
