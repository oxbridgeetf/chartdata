// --- Global Formatting Functions ---
const formatFunctions = {
    Dollar2: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input; // Handle Tabulator cell or raw value
        if (typeof value === "string") {
        return value; // Return the string as-is
    }
        return "$" +
            Number(value).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
    },
    Dollar0: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        const formatted =
            "$" +
            Number(value).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        console.log(`Dollar0 formatted: input=${value}, output=${formatted}`);
        return formatted;
    },
    Dollar4: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        return "$" +
            Number(value).toLocaleString("en-US", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
            });
    },
    Perc0: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        if (typeof value === "string") {
        return value; // Return the string as-is
    }
        return (value * 100).toFixed(0) + "%";
    },
    Perc2: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        if (typeof value === "string") {
        return value; // Return the string as-is
    }
        return (value * 100).toFixed(2) + "%";
    },
    Perc4: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        if (typeof value === "string") {
        return value; // Return the string as-is
    }
        return (value * 100).toFixed(4) + "%";
    },
    Text: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        return value ? value.toString() : ""; // Safely handle undefined or null values
    },
    TextTest: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        return (value || "").toString() + "*"; // Safely handle undefined or null values
    },
    Dec0: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    },
    Dec2: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        if (typeof value === "string") {
        return value; // Return the string as-is
    }
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    },
    Dec4: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        });
    },

    // SpecialDate function
    SpecialDate: (input) => {
        const value = typeof input === "object" && input.getValue ? input.getValue() : input;
        if (!value) return ""; // Return empty if no value

        if (value.includes("/")) {
            // Parse the date and convert it to Mmm Dth (st/rd/th)
            const date = new Date(value);
            const day = date.getDate();
            const month = date.toLocaleString("default", { month: "short" });

            let suffix = "th";
            if (day === 1 || day === 21 || day === 31) suffix = "st";
            if (day === 2 || day === 22) suffix = "nd";
            if (day === 3 || day === 23) suffix = "rd";

            return `${month} ${day}${suffix}`;
        } else {
            // Return text if no "/" is found
            return value;
        }
    },
};

const questionJsonUrl = "https://raw.githubusercontent.com/oxbridgeetf/chartdata/main/questions.json";

// Load JSON and assign globally
fetch(questionJsonUrl)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    window.questionData = data;
    console.log("Questions loaded:", window.questionData);

    // If any functions are waiting for questions to load
    if (window.onQuestionsReady && Array.isArray(window.onQuestionsReady)) {
      window.onQuestionsReady.forEach(fn => fn());
      window.onQuestionsReady = []; // Clear the queue
    }
  })
  .catch(error => {
    console.error("Failed to load questions.json:", error);
  });


window.loadQuestion = function(index = 0) {
  const player = GetPlayer();
  const q = window.questionData[index];
  const choices = [q.Choice1, q.Choice2, q.Choice3, q.Choice4, q.Choice5] || [];
  const letterLabels = ["A", "B", "C", "D", "E"];
  const correctLetter = q.Correct;
  const correctIndex = letterLabels.indexOf(correctLetter);
  
  const correctText = choices[correctIndex] || "";
  
  for (let i = 0; i < 5; i++) {
    const text = choices[i] || "";
    player.SetVar(`Answer${i + 1}`, text);
    player.SetVar(`ShowAns${i + 1}`, text.trim() !== "");
  }

  player.SetVar("QText", q.Question || "");
  player.SetVar("CorrectAnswerIndex", correctIndex + 1);
  const feedbackText = `The correct answer is ${correctLetter}: ${correctText}`;
  player.SetVar("incorrect", feedbackText);
}

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
    CinnabarHalf: 'rgb(236, 74, 39, 0.5)',
    Robin: 'rgb(52,192,206)',
    RobinHalf: 'rgb(52,192,206, 0.5)',
    Persian: 'rgb(198,62,48)',
    PersianHalf: 'rgb(198,62,48, 0.5)',
    Columbia: 'rgb(2203,216,221)',
    Alabaster: 'rgb(229,230,217)',
    Tea: 'rgb(221,232,185)',
    TeaHalf: 'rgb(221,232,185, 0.5)'

    // Add any other colors you need
};

// Export the color palette so it's available globally
window.colorPalette = colorPalette;

function highlightRow(table, rowIndex, color = 'highlightYellow', duration = null) {
    const row = table.getRows()[rowIndex];
    if (!row) return;
console.log("Up3");
    const el = row.getElement();
    const colorVal = colorPalette[color] || colorPalette.highlightYellow;

    // Apply inset box-shadow instead of backgroundColor
    el.style.transition = "box-shadow 0.3s ease";
    el.style.boxShadow = `inset 0 0 0 1000px ${colorVal}`;

    if (duration) {
        setTimeout(() => {
            el.style.boxShadow = "";
        }, duration);
    }
}

function highlightColumn(table, fieldName, color = 'highlightYellow', duration = null) {
    const colorVal = colorPalette[color] || colorPalette.highlightYellow;

    table.getRows().forEach(row => {
        const cell = row.getCell(fieldName);
        if (cell) {
            const el = cell.getElement();
            el.style.transition = "box-shadow 0.3s ease";
            el.style.boxShadow = `inset 0 0 0 1000px ${colorVal}`;

            if (duration) {
                setTimeout(() => {
                    el.style.boxShadow = "";
                }, duration);
            }
        }
    });
}
function highlightCell(table, rowIndex, fieldName, color = 'highlightYellow', duration = null) {
    const row = table.getRows()[rowIndex];
    if (!row) return;

    const cell = row.getCell(fieldName);
    if (!cell) return;

    const cellEl = cell.getElement();
    const colorVal = colorPalette[color] || colorPalette.highlightYellow;

    // Get computed padding so overlay doesn't overflow
    const style = window.getComputedStyle(cellEl);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingRight = parseFloat(style.paddingRight);
    console.log("HybridFade");

    // Create a precise overlay
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";//`${paddingRight}px`;
    overlay.style.bottom = "0";//`${paddingBottom}px`;
    overlay.style.backgroundColor = colorVal;
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "0";
    overlay.style.borderRadius = "0px";

    // Add opacity and transition for smooth fade in/out
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.5s ease";

    cellEl.style.position = "relative";
    [...cellEl.children].forEach(child => {
        child.style.position = "relative";
        child.style.zIndex = "1";
    });
    cellEl.appendChild(overlay);

    // Trigger fade-in
    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
    });

    if (duration) {
        setTimeout(() => {
            // fade out
            overlay.style.opacity = "0";
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 500); // match transition duration
        }, duration);
    }
}



// --- Global Functions to Highlight Rows/Cols/Cells ---
/*function highlightRow(table, rowIndex, color = 'highlightYellow', duration = null) {
    const row = table.getRows()[rowIndex];
    if (!row) return;
    const el = row.getElement();
    const colorVal = colorPalette[color] || colorPalette.highlightYellow;
    el.style.transition = "background-color 0.5s ease";
    el.style.backgroundColor = colorVal;
    if (duration) setTimeout(() => el.style.backgroundColor = "", duration);
}

function highlightColumn(table, fieldName, color = 'highlightYellow', duration = null) {
    const colorVal = colorPalette[color] || colorPalette.highlightYellow;
    table.getRows().forEach(row => {
        const cell = row.getCell(fieldName);
        if (cell) {
            const el = cell.getElement();
            el.style.transition = "background-color 0.5s ease";
            el.style.backgroundColor = colorVal;
            if (duration) setTimeout(() => el.style.backgroundColor = "", duration);
        }
    });
}

function highlightCell(table, rowIndex, fieldName, color = 'highlightYellow', duration = null) {
    const row = table.getRows()[rowIndex];
    if (!row) return;
    const cell = row.getCell(fieldName);
    if (!cell) return;
    const el = cell.getElement();
    const colorVal = colorPalette[color] || colorPalette.highlightYellow;
    el.style.transition = "background-color 0.5s ease";
    el.style.backgroundColor = colorVal;
    if (duration) setTimeout(() => el.style.backgroundColor = "", duration);
}*/

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


function initDynamicFormattedTable(containerName, dataOrUrl, ColumnNames, FormatArray, columnHeaders = null, firstColumnWidth = null, styleVector = null) {
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

    // Validate styleVector
    let rowHeight = null;
    let textSize = null;
    if (styleVector && Array.isArray(styleVector) && styleVector.length === 2) {
        [rowHeight, textSize] = styleVector;
    } else if (styleVector) {
        console.error("styleVector must be a 2x1 array [rowHeight, textSize].");
        return;
    }

    // Determine total table width
    const totalTableWidth = container.offsetWidth || 800; // Default to 800px if width cannot be determined

    // Calculate widths
    const remainingColumns = ColumnNames.length - 1;
    const remainingWidth = totalTableWidth - (firstColumnWidth || 0);
    const otherColumnWidth = remainingColumns > 0 ? Math.floor(remainingWidth / remainingColumns) : remainingWidth;

    // Dynamically create column definitions
    let finalColumns = ColumnNames.map((colName, idx) => {
        const formatType = FormatArray[idx];
        const formatterFn = formatFunctions[formatType] || formatFunctions.Text; // Default to 'Text' if format is not found

        const columnDef = {
            title: columnHeaders ? columnHeaders[idx] : colName, // Use custom headers if provided
            field: colName,
            formatter: formatterFn, // Apply the formatter
            headerSort: false, // Disable sorting by default
        };

        // Set column width
        if (idx === 0 && firstColumnWidth) {
            columnDef.width = firstColumnWidth; // Set width for the first column
        } else if (remainingColumns > 0) {
            columnDef.width = otherColumnWidth; // Distribute width across remaining columns
        }

        return columnDef;
    });

    console.log("Final Columns with Calculated Widths:", finalColumns);

    // Apply row height and text size styles
    if (rowHeight || textSize) {
        const style = document.createElement("style");
        style.textContent = `
            [data-acc-text='${containerName}'] .tabulator-row {
                height: ${rowHeight || "auto"}px; /* Apply row height */
                border-top: 2px solid #aaa; /* Add a top border to rows */
            }
            [data-acc-text='${containerName}'] .tabulator-cell {
                font-size: ${textSize || "inherit"}px; /* Apply text size */
            }
            [data-acc-text='${containerName}'] .tabulator-header .tabulator-col {
                font-size: ${textSize || "inherit"}px; /* Apply header text size */
            }
            [data-acc-text='${containerName}'] .tabulator-header {
                border-bottom: none !important; /* Remove bottom border of the header */
            }
        `;
        document.head.appendChild(style);
    }

    // Process dataOrUrl
    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        fetch(dataOrUrl)
            .then((response) => response.json())
            .then((jsonData) => {
                console.log("Raw JSON Data:", jsonData);

                const tableOptions = {
                    layout: "fitColumns",
                    data: jsonData,
                    columns: finalColumns,
                };

                const table = new Tabulator(container, tableOptions);
                container._tabulatorTable = table;
            })
            .catch((error) => console.error("Error fetching JSON file:", error));
    } else if (Array.isArray(dataOrUrl)) {
        console.log("Raw DataOrUrl Array:", dataOrUrl);

        const tableOptions = {
            layout: "fitColumns",
            data: dataOrUrl,
            columns: finalColumns,
        };

        const table = new Tabulator(container, tableOptions);
        container._tabulatorTable = table;
    } else {
        console.error("Invalid dataOrUrl parameter. Must be a JSON array or a URL to a .json file.");
    }
}

function initDynamicFormattedTableWithRem(containerName, dataOrUrl, ColumnNames, FormatArray, columnHeaders = null, firstColumnWidth = null) {
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

    // Create a container div for Tabulator
    const tableContainer = document.createElement("div");
    tableContainer.style.width = "100%";
    tableContainer.style.height = "100%";
    tableContainer.style.fontSize = "1rem"; // Initial rem-based font size
    container.appendChild(tableContainer);

    // Dynamically create column definitions
    // Dynamically create column definitions
let finalColumns = ColumnNames.map((colName, idx) => {
    const formatType = FormatArray[idx];
    const formatterFn = formatFunctions[formatType] || formatFunctions.Text;

    const columnDef = {
        title: columnHeaders ? columnHeaders[idx] : colName,
        field: colName,
        formatter: formatterFn,
        headerSort: false,
    };

    // Support both legacy single-number width and new array of widths
    if (typeof firstColumnWidth === "number" && idx === 0) {
        columnDef.width = firstColumnWidth;
    } else if (Array.isArray(firstColumnWidth) && firstColumnWidth[idx] !== undefined) {
        columnDef.width = firstColumnWidth[idx];
    }

    return columnDef;
});


    console.log("Final Columns with Calculated Widths:", finalColumns);

    // Create style tag for Tabulator + rem styling
    const style = document.createElement("style");
    style.textContent = `
        [data-acc-text='${containerName}'] .tabulator {
            font-size: 1rem; /* Base font size */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-row {
            height: auto; /* Adjust row height automatically */
            border-top: 2px solid #aaa; /* Add a top border to rows */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-cell {
            font-size: inherit; /* Inherit font size from container */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header .tabulator-col {
            font-size: inherit; /* Inherit font size from container */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header {
            border-bottom: none !important; /* Remove bottom border of the header */
        }
    `;
    document.head.appendChild(style);

    // Scale font-size based on container width (dynamic rem scaling)
    function scaleRem() {
        const w = container.offsetWidth;
        const remBase = Math.max(12, Math.min(20, w / 50)); // Scale font size between 12px and 20px
        tableContainer.style.fontSize = remBase + "px";
    }

    scaleRem();
    window.addEventListener("resize", () => {
        scaleRem();
        if (container._tabulatorTable) container._tabulatorTable.redraw(true);
    });

    // Process dataOrUrl
    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        fetch(dataOrUrl)
            .then((response) => response.json())
            .then((jsonData) => {
                console.log("Raw JSON Data:", jsonData);

                const tableOptions = {
                    layout: "fitColumns",
                    data: jsonData,
                    columns: finalColumns,
                };

                const table = new Tabulator(tableContainer, tableOptions);
                container._tabulatorTable = table;
            })
            .catch((error) => console.error("Error fetching JSON file:", error));
    } else if (Array.isArray(dataOrUrl)) {
        console.log("Raw DataOrUrl Array:", dataOrUrl);

        const tableOptions = {
            layout: "fitColumns",
            data: dataOrUrl,
            columns: finalColumns,
        };

        const table = new Tabulator(tableContainer, tableOptions);
        container._tabulatorTable = table;
    } else {
        console.error("Invalid dataOrUrl parameter. Must be a JSON array or a URL to a .json file.");
    }
}

function initResponsiveTable(containerName, dataOrUrl, ColumnNames, FormatArray, columnHeaders = null, firstColumnWidth = null) {
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

    // Create a container div for Tabulator
    const tableContainer = document.createElement("div");
    tableContainer.style.width = "100%";
    tableContainer.style.height = "100%";
    tableContainer.style.fontSize = "1rem"; // Initial rem-based font size
    container.appendChild(tableContainer);

    // Dynamically create column definitions
    let finalColumns = ColumnNames.map((colName, idx) => {
        const formatType = FormatArray[idx];
        const formatterFn = formatFunctions[formatType] || formatFunctions.Text; // Default to 'Text' if format is not found

        const columnDef = {
            title: columnHeaders ? columnHeaders[idx] : colName, // Use custom headers if provided
            field: colName,
            formatter: formatterFn, // Apply the formatter
            headerSort: false, // Disable sorting by default
        };

        // Set column width
        if (idx === 0 && firstColumnWidth) {
            columnDef.width = firstColumnWidth; // Set width for the first column
        }

        return columnDef;
    });

    console.log("Final Columns with Calculated Widths:", finalColumns);

    // Create style tag for Tabulator + rem styling
    const style = document.createElement("style");
    style.textContent = `
        [data-acc-text='${containerName}'] .tabulator {
            font-size: 1rem; /* Base font size */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-row {
            height: auto; /* Adjust row height automatically */
            border-top: 2px solid #aaa; /* Add a top border to rows */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-cell {
            font-size: inherit; /* Inherit font size from container */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header .tabulator-col {
            font-size: inherit; /* Inherit font size from container */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header {
            border-bottom: none !important; /* Remove bottom border of the header */
        }
    `;
    document.head.appendChild(style);

    // Scale font-size and row height based on container dimensions
    function scaleResponsive() {
        const w = container.offsetWidth;
        const h = container.offsetHeight;

        // Dynamically calculate font size and row height
        const remBase = Math.max(12, Math.min(20, w / 50)); // Scale font size between 12px and 20px
        tableContainer.style.fontSize = remBase + "px";

        // Optional: Adjust row height based on the container's height
        const rowHeight = Math.max(30, Math.min(50, h / 15)); // Ensure row height is between 30px and 50px
        style.textContent += `
            [data-acc-text='${containerName}'] .tabulator .tabulator-row {
                height: ${rowHeight}px;
            }
        `;
    }

    scaleResponsive();
    window.addEventListener("resize", () => {
        scaleResponsive();
        if (container._tabulatorTable) container._tabulatorTable.redraw(true);
    });

    // Process dataOrUrl
    if (typeof dataOrUrl === "string" && dataOrUrl.endsWith(".json")) {
        fetch(dataOrUrl)
            .then((response) => response.json())
            .then((jsonData) => {
                console.log("Raw JSON Data:", jsonData);

                const tableOptions = {
                    layout: "fitColumns",
                    data: jsonData,
                    columns: finalColumns,
                };

                const table = new Tabulator(tableContainer, tableOptions);
                container._tabulatorTable = table;
            })
            .catch((error) => console.error("Error fetching JSON file:", error));
    } else if (Array.isArray(dataOrUrl)) {
        console.log("Raw DataOrUrl Array:", dataOrUrl);

        const tableOptions = {
            layout: "fitColumns",
            data: dataOrUrl,
            columns: finalColumns,
        };

        const table = new Tabulator(tableContainer, tableOptions);
        container._tabulatorTable = table;
    } else {
        console.error("Invalid dataOrUrl parameter. Must be a JSON array or a URL to a .json file.");
    }
}

function updateTabulatorCell(containerName, rowIndex, field, newValue) {
   const containerSelector = `[data-acc-text='${containerName}']`;
   const table = Tabulator.findTable(containerSelector)[0];
  if (!table) {
    console.error("Tabulator table not found in", containerSelector);
    return;
  }

  const rowComponent = table.getRows()[rowIndex];
  if (!rowComponent) {
    console.warn("Row not found at index:", rowIndex);
    return;
  }

  rowComponent.update({ [field]: newValue });
}

function initRemTable(...args) {
    let config;

    if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
        config = args[0];
    } else {
        const [
            containerName,
            dataOrUrl,
            ColumnNames,
            FormatArray,
            hdrs = null,
            colWidthVector = null,
            styleVector = null,
            justifyVector = null
        ] = args;

        config = {
            containerName,
            dataOrUrl,
            ColumnNames,
            FormatArray,
            hdrs,
            colWidthVector,
            styleVector,
            justifyVector
        };
    }

    const {
        containerName,
        dataOrUrl,
        ColumnNames,
        FormatArray,
        hdrs = null,
        colWidthVector = null,
        styleVector = null,
        justifyVector = null
    } = config;
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

    if (!Array.isArray(ColumnNames) || !Array.isArray(FormatArray) || ColumnNames.length !== FormatArray.length) {
        console.error("ColumnNames and FormatArray must be arrays of the same length.");
        return;
    }

    const tableContainer = document.createElement("div");
    tableContainer.style.width = "100%";
    tableContainer.style.height = "100%";
    tableContainer.style.fontSize = "1rem";
    container.appendChild(tableContainer);

    const alignMap = { L: "left", C: "center", R: "right" };

    const finalColumns = ColumnNames.map((colName, idx) => {
    const formatType = FormatArray[idx];
    const formatterFn = formatFunctions[formatType] || formatFunctions.Text;

    const columnDef = {
        title: hdrs ? hdrs[idx] : colName,
        field: colName,
        formatter: formatterFn,
        headerSort: false,
    };

    if (justifyVector && justifyVector[idx]) {
        const alignment = alignMap[justifyVector[idx]] || "left";
        columnDef.hozAlign = alignment;

        // Force header text-align via titleFormatter
        const rawTitle = columnDef.title;
        columnDef.titleFormatter = () => {
            return `<div style="text-align: ${alignment}; width: 100%;">${rawTitle}</div>`;
        };
    }

    if (typeof colWidthVector === "number" && idx === 0) {
        columnDef.width = colWidthVector;
    } else if (Array.isArray(colWidthVector) && colWidthVector[idx] !== undefined) {
        columnDef.width = colWidthVector[idx];
    }

    return columnDef;
});


    console.log("Final Columns with Calculated Widths:", finalColumns);

    const style = document.createElement("style");
    style.textContent = `
        [data-acc-text='${containerName}'] .tabulator {
            font-size: 1rem;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-row {
            height: auto;
            border-top: 2px solid #aaa;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-cell {
            font-size: inherit;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header .tabulator-col {
            font-size: inherit;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header {
            border-bottom: none !important;
        }

        /* Header alignment styles */
        [data-acc-text='${containerName}'] .tabulator .tabulator-col.align-left .tabulator-col-title {
            text-align: left;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-col.align-center .tabulator-col-title {
            text-align: center;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-col.align-right .tabulator-col-title {
            text-align: right;
        }
    `;
    document.head.appendChild(style);

    function scaleRem(totalRowCount) {
        const containerHeight = container.offsetHeight;
        const computedStyle = getComputedStyle(container);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
        const usableHeight = containerHeight - (paddingTop + paddingBottom + borderTop + borderBottom);

        const rowHeight = usableHeight / totalRowCount;
        const scalingFactor = 2;
        const remBase = Math.max(styleVector[1], Math.min(styleVector[0], rowHeight / scalingFactor));

        tableContainer.style.fontSize = `${remBase}px`;

        console.log(`Container Height: ${containerHeight}, Usable Height: ${usableHeight}, Total Rows: ${totalRowCount}, Row Height: ${rowHeight}, Rem Base: ${remBase}`);
    }

    let totalRowCount = 0;
    window.addEventListener("resize", () => {
        if (totalRowCount > 0) {
            scaleRem(totalRowCount);
            if (container._tabulatorTable) container._tabulatorTable.redraw(true);
        }
    });

    fetch(dataOrUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data from ${dataOrUrl}: ${response.statusText}`);
            }
            return response.json();
        })
        .then((jsonData) => {
            console.log("Raw JSON Data:", jsonData);
            totalRowCount = jsonData.length + 1;

            const tableOptions = {
                layout: "fitColumns",
                data: jsonData,
                columns: finalColumns,
            };

            const table = new Tabulator(tableContainer, tableOptions);
            container._tabulatorTable = table;

            scaleRem(totalRowCount);
        })
        .catch((error) => console.error("Error fetching JSON file:", error));
}
