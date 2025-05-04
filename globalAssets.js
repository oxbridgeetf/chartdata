// --- Import Colors, Formats, and Shared Utilities ---
import { formatFunctions, colorPalette } from './colorsAndFormats.js';
import { loadAssets, destroyChartsAndTables } from './sharedUtils.js';
window.loadAssets = loadAssets;
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
function initFormattedTable(containerName, tableType, dataUrl, col2FormatArray = null, columnHeaders = null) {
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

    // Always expect JSON URLs since all data is in JSON format
    loadData(dataUrl, containerName, finalColumns);
}
