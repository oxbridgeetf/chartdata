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


/*window.loadQuestion = function(index = 0) {
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
}*/

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
    LtGreen: 'rgb(183,206,107)',
    Oxford: 'rgb(16,29,62)',
    Cadet: 'rgb(155,184,193)',
    Cinnabar: 'rgb(236, 74, 39)',
    CinnabarHalf: 'rgb(236, 74, 39, 0.5)',
    Robin: 'rgb(52,192,206)',
    RobinHalf: 'rgb(52,192,206, 0.5)',
    Persian: 'rgb(198,62,48)',
    PersianHalf: 'rgb(198,62,48, 0.5)',
    Columbia: 'rgb(203,216,221)',
    Alabaster: 'rgb(229,230,217)',
    Tea: 'rgb(221,232,185)',
    TeaHalf: 'rgb(221,232,185, 0.5)'

    // Add any other colors you need
};

// Export the color palette so it's available globally
window.colorPalette = colorPalette;

// --- SVG Inject Helper for Storyline Shapes ---
function insertSvgIntoShape(shapeName, svgUrl) {
    // Find the Storyline shape by its accessibility name
    const targetShape = document.querySelector(
        `[data-acc-text='${shapeName}']`
    );

    if (!targetShape) {
        console.warn(`insertSvgIntoShape: Shape '${shapeName}' not found.`);
        return;
    }

    // If this shape previously hosted a Tabulator table, destroy it cleanly
    if (targetShape._tabulatorTable && typeof targetShape._tabulatorTable.destroy === "function") {
        try {
            targetShape._tabulatorTable.destroy();
        } catch (e) {
            console.warn("insertSvgIntoShape: error destroying Tabulator table:", e);
        }
        targetShape._tabulatorTable = null;
    }

    // If there are any Chart.js canvases inside this shape, clean them up
    const canvases = targetShape.querySelectorAll("canvas");
    canvases.forEach((canvas) => {
        try {
            const inst = window.Chart?.getChart?.(canvas);
            if (inst && typeof inst.destroy === "function") {
                inst.destroy();
            }
        } catch (e) {
            console.warn("insertSvgIntoShape: error destroying Chart instance:", e);
        }
        canvas.remove();
    });

    // Clear anything else inside the shape
    while (targetShape.firstChild) {
        targetShape.removeChild(targetShape.firstChild);
    }

    // Create an <img> element that fills the shape and displays the SVG
    const img = document.createElement("img");
    img.src = svgUrl;
    img.alt = ""; // decorative; you can set a meaningful alt if needed

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.display = "block";
    img.style.objectFit = "contain";   // keep aspect ratio, no distortion
    img.style.margin = "0";
    img.style.padding = "0";
    img.style.border = "none";

    targetShape.appendChild(img);
}




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
    console.log('highlightColumn called');
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
function highlightCellOld(table, rowIndex, fieldName, color = 'highlightYellow', duration = null) {
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
    //overlay.style.bottom = "0";//`${paddingBottom}px`;
    overlay.style.height = '80%';
    overlay.style.backgroundColor = colorVal;
    overlay.style.pointerEvents = "none";
    //overlay.style.zIndex = "0";
    overlay.style.zIndex = "-1";
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
function highlightCell(table, rowIndex, fieldName, color = 'highlightYellow', duration = null) {
    const row = table.getRows()[rowIndex];
    if (!row) return;
console.log("HighlightCellCalled");
    const cell = row.getCell(fieldName);
    if (!cell) return;

    const cellEl = cell.getElement();
    const colorVal = colorPalette[color] || colorPalette.highlightYellow;

    cellEl.style.transition = "box-shadow 0.3s ease";
    cellEl.style.boxShadow = `inset 0 0 0 1000px ${colorVal}`;

    if (duration) {
        setTimeout(() => {
            cellEl.style.boxShadow = "";
        }, duration);
    }
}

function changeCellValue(table, rowIndex, fieldName, newValue) {
    const row = table.getRows()[rowIndex];
    if (!row) return;

    const cell = row.getCell(fieldName);
    if (!cell) return;

    cell.setValue(newValue);
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

// --- Load Chartjs inside of globalAssets
function loadChartJS(callback) {
    const existing = document.querySelector("script[data-chartjs]");
    if (existing) {
        if (callback) callback();
        return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";  // or your preferred URL
    script.dataset.chartjs = "true";
    script.onload = () => {
        console.log("Chart.js loaded globally.");
        if (callback) callback();
    };
    script.onerror = () => console.error("Failed to load Chart.js");
    document.head.appendChild(script);
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
    tabulatorScript.onload = function () {
        console.log("Tabulator loaded.");

        // NOW load Chart.js
        loadChartJS(function () {
            console.log("Chart.js ready.");

            if (typeof callback === "function") {
                callback();
            }
        });
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

// SVG Functionality
/**
 * initSvgTableWithFormat
 * Render an SVG table into a Storyline shape using ColumnNames + FormatArray + formatFunctions.
 *
 * @param {string} containerName   Storyline accessibility name (e.g. "rect1")
 * @param {string|Array<Object>} dataOrUrl  URL to .json or in-memory array of row objects
 * @param {Array<string>} ColumnNames   field names to use for columns (e.g. ["Col1","Col2"])
 * @param {Array<string>} FormatArray   format types per column (e.g. ["Text","Dollar2","Perc2"])
 * @param {Array<string>} [hdrs]        optional headers (default: ColumnNames)
 * @param {number} [fontSizePt=14]      optional font size in pt
 * @param {Array<string>} [justify]     optional alignment codes per column: ["L","C","R",...]
 * @param {boolean} [bgOxford=false]    optional Oxford Blue background
 */
function initSvgTableWithFormat(
  containerName,
  dataOrUrl,
  ColumnNames,
  FormatArray,
  headers = null,
  fontSizePt = 14,
  justifyVec = null,
  bgOxford = false
) {
  const selector = `[data-acc-text='${containerName}']`;
  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container with accessibility name '${containerName}' not found.`);
    return;
  }

  // Clear anything previously in the container
  container.innerHTML = "";

  // Helper: points to pixels
  const ptsToPx = (pts) => pts * (96 / 72); // ~1.3333

  // Fetch JSON data
  fetch(dataOrUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${dataOrUrl}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        console.error("initSvgTableWithFormat: JSON data is empty or invalid.");
        return;
      }

      const numRows = data.length;

      // Determine columns
      const colKeys = Array.isArray(ColumnNames) && ColumnNames.length > 0
        ? ColumnNames
        : Object.keys(data[0]);

      const numCols = colKeys.length;

      // Headers
      const headerLabels =
        Array.isArray(headers) && headers.length === numCols
          ? headers
          : colKeys;

      // Justification (L/C/R per column)
      let just = [];
      if (Array.isArray(justifyVec) && justifyVec.length === numCols) {
        just = justifyVec.map(j => {
          const code = (j || "L").toUpperCase();
          return (code === "L" || code === "C" || code === "R") ? code : "L";
        });
      } else {
        just = new Array(numCols).fill("L");
      }

      // SVG size from container or fallback
      const rect = container.getBoundingClientRect();
      const svgWidth = rect.width > 0 ? rect.width : 800;
      const svgHeight = rect.height > 0 ? rect.height : 500;

      // Layout calculations: row height vs. font size
      let fontSizePx = ptsToPx(fontSizePt);
      const lineFactor = 1.5; // row height ≈ 1.5 × font size

      let rowHeight = fontSizePx * lineFactor;
      let headerRowHeight = rowHeight;

      const totalNeededHeight = headerRowHeight + numRows * rowHeight;

      if (totalNeededHeight > svgHeight && numRows > 0) {
        // Compute max row height that fits header + all data rows
        const maxRowHeight = svgHeight / (1 + numRows);
        rowHeight = maxRowHeight;
        headerRowHeight = maxRowHeight;
        // Adjust font size so it fits nicely within this row height
        fontSizePx = maxRowHeight / lineFactor;
      }

      const marginLeft = 0;
      const marginRight = 0;
      const tableWidth = svgWidth; // span entire width

      const topRuleY = 0;

      const headerBandHeight = headerRowHeight;
      const headerCenterY = topRuleY + headerBandHeight / 2;
      const headerDividerY = topRuleY + headerBandHeight;

      // Vertical offset to visually center text between lines
      const verticalOffset = fontSizePx * 0.12;

      // No inner left/right padding: text flush to column bounds
      const innerPad = 0;

      function escapeXml(value) {
        const s = String(value ?? "");
        return s
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      }

      // Colors (use global palette if available, else fallbacks)
      const palette = window.colorPalette || {};
      const COLORS = {
        persian: palette.Persian || "rgb(198,62,48)",
        cadet: palette.Cadet || "rgb(155,184,193)",
        white: "rgb(255,255,255)",
        oxford: palette.Oxford || "rgb(16,29,62)"
      };

      // Helper: format value using your existing formatFunctions if possible
      function formatCellValue(rawVal, fmtType) {
        if (rawVal === null || rawVal === undefined || rawVal === "") return "";
        if (!fmtType || !window.formatFunctions || typeof window.formatFunctions[fmtType] !== "function") {
          return String(rawVal);
        }
        try {
          return String(window.formatFunctions[fmtType](rawVal));
        } catch (e) {
          console.warn("Error formatting value", rawVal, "with", fmtType, e);
          return String(rawVal);
        }
      }

      // ---------------------------------------
      //  Measure each column's text to get widths
      // ---------------------------------------
      const measureCanvas = document.createElement("canvas");
      const ctx = measureCanvas.getContext("2d");
      ctx.font = `${fontSizePx}px "Montserrat", sans-serif`;

      const colTextWidths = [];

      for (let colIndex = 0; colIndex < numCols; colIndex++) {
        const key = colKeys[colIndex];
        const fmtType = Array.isArray(FormatArray) ? FormatArray[colIndex] : null;

        // Width of header
        const headerText = String(headerLabels[colIndex] ?? "");
        let maxWidth = ctx.measureText(headerText).width;

        // Width of all data cells in this column
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
          const rowData = data[rowIndex];
          const rawVal = rowData[key];
          const formatted = formatCellValue(rawVal, fmtType);
          const w = ctx.measureText(String(formatted)).width;
          if (w > maxWidth) maxWidth = w;
        }

        // Add a small padding factor so text isn't right on the line
        const padded = maxWidth + fontSizePx * 0.4; // tweak if needed
        colTextWidths.push(padded);
      }

      // Scale these widths so they fill the available tableWidth
      let totalTextWidth = colTextWidths.reduce((sum, w) => sum + w, 0);
      let colWidthsScaled = [];
      if (totalTextWidth > 0) {
        const scale = tableWidth / totalTextWidth;
        colWidthsScaled = colTextWidths.map(w => w * scale);
      } else {
        // Fallback: equal widths
        const equal = tableWidth / numCols;
        colWidthsScaled = new Array(numCols).fill(equal);
      }

      // Derive column start/end positions
      const colStartX = [];
      const colEndX = [];
      let currentX = marginLeft;
      for (let i = 0; i < numCols; i++) {
        colStartX.push(currentX);
        const nextX = currentX + colWidthsScaled[i];
        colEndX.push(nextX);
        currentX = nextX;
      }

      function getTextPosition(colIndex, align) {
        const start = colStartX[colIndex];
        const end = colEndX[colIndex];
        const center = (start + end) / 2;

        if (align === "C") {
          return { x: center, anchor: "middle" };
        } else if (align === "R") {
          return { x: end - innerPad, anchor: "end" };
        } else {
          return { x: start + innerPad, anchor: "start" };
        }
      }

      // --- BUILD SVG ---
      let svgParts = [];

      // Add layout metadata on the <svg> so SVGhighlight can read it later
      svgParts.push(
        `<svg width="${svgWidth}" height="${svgHeight}" ` +
        `viewBox="0 0 ${svgWidth} ${svgHeight}" ` +
        `xmlns="http://www.w3.org/2000/svg" ` +
        `data-rows="${numRows}" ` +
        `data-cols="${numCols}" ` +
        `data-header-divider-y="${headerDividerY}" ` +
        `data-row-height="${rowHeight}" ` +
        `data-margin-left="${marginLeft}" ` +
        `data-margin-right="${marginRight}" ` +
        `data-col-start-x="${colStartX.join(',')}" ` +
        `data-col-end-x="${colEndX.join(',')}">`
      );

      // Optional Oxford Blue background
      if (bgOxford) {
        svgParts.push(
          `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="${COLORS.oxford}" />`
        );
      }

      // Styles
      svgParts.push(`
  <style>
    .header {
      font-family: "Montserrat", sans-serif;
      font-size: ${fontSizePx}px;
      font-weight: 700;
      fill: ${COLORS.white};
      dominant-baseline: middle;
    }
    .cell {
      font-family: "Montserrat", sans-serif;
      font-size: ${fontSizePx}px;
      font-weight: 400;
      fill: ${COLORS.white};
      dominant-baseline: middle;
    }
  </style>
`);

      // Top Persian Red rule (slightly thicker than row lines)
      const topStrokeWidth = ptsToPx(2);      // 2pt top rule
      const rowStrokeWidth = ptsToPx(1);      // 1pt row dividers

      svgParts.push(
        `<line x1="${marginLeft}" y1="${topRuleY}" ` +
        `x2="${svgWidth - marginRight}" y2="${topRuleY}" ` +
        `stroke="${COLORS.persian}" stroke-width="${topStrokeWidth}" />`
      );

      // Headers
      for (let i = 0; i < numCols; i++) {
        const label = headerLabels[i];
        const align = just[i];
        const { x, anchor } = getTextPosition(i, align);
        svgParts.push(
          `<text x="${x}" y="${headerCenterY + verticalOffset}" ` +
          `class="header" text-anchor="${anchor}">${escapeXml(label)}</text>`
        );
      }

      // Header bottom divider (Cadet)
      svgParts.push(
        `<line x1="${marginLeft}" y1="${headerDividerY}" ` +
        `x2="${svgWidth - marginRight}" y2="${headerDividerY}" ` +
        `stroke="${COLORS.cadet}" stroke-width="${rowStrokeWidth}" />`
      );

      // Row dividers: Cadet for all but last; last row bottom is Persian
      for (let i = 1; i <= numRows; i++) {
        const y = headerDividerY + rowHeight * i;
        const isLast = (i === numRows);
        const color = isLast ? COLORS.persian : COLORS.cadet;
        svgParts.push(
          `<line x1="${marginLeft}" y1="${y}" ` +
          `x2="${svgWidth - marginRight}" y2="${y}" ` +
          `stroke="${color}" stroke-width="${rowStrokeWidth}" />`
        );
      }

      // Data rows
      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const rowData = data[rowIndex];
        const centerY = headerDividerY + rowHeight * (rowIndex + 0.5);

        for (let colIndex = 0; colIndex < numCols; colIndex++) {
          const key = colKeys[colIndex];
          const fmtType = Array.isArray(FormatArray) ? FormatArray[colIndex] : null;
          const rawVal = rowData[key];
          const textVal = formatCellValue(rawVal, fmtType);
          const align = just[colIndex];

          const { x, anchor } = getTextPosition(colIndex, align);

          svgParts.push(
            `<text x="${x}" y="${centerY + verticalOffset}" ` +
            `class="cell" text-anchor="${anchor}">${escapeXml(textVal)}</text>`
          );
        }
      }

      svgParts.push(`</svg>`);

      // Inject SVG into container
      container.innerHTML = svgParts.join("");
    })
    .catch((err) => {
      console.error("initSvgTableWithFormat error:", err);
    });
}

/**
 * SVGhighlight
 * Drop a translucent overlay on top of an SVG table rendered by initSvgTableWithFormat,
 * with fade-in and optional fade-out.
 *
 * @param {string} containerName  Storyline acc name, e.g. "rect1"
 * @param {string} kind           "Row", "Col"/"Column", or "Cell"
 * @param {number|Array} target   Row index, col index, or [rowIndex, colIndex] (0-based)
 * @param {string} colorKey       key from colorPalette, e.g. "RobinHalf", "TeaHalf"
 * @param {number} [durationMs]   optional; if set, overlay fades out and is removed after this many ms
 */
function SVGhighlight(containerName, kind, target, colorKey, durationMs) {
    const name = String(containerName);

    const container = document.querySelector(`[data-acc-text='${name}']`);
    if (!container) {
        console.error(`SVGhighlight: container '${name}' not found.`);
        return;
    }

    const svg = container.querySelector("svg");
    if (!svg) {
        console.error(`SVGhighlight: no <svg> found inside container '${name}'.`);
        return;
    }

    // Read layout metadata from <svg>
    const rows = parseInt(svg.getAttribute("data-rows") || "0", 10);
    const cols = parseInt(svg.getAttribute("data-cols") || "0", 10);
    const headerDividerY = parseFloat(svg.getAttribute("data-header-divider-y") || "0");
    const rowHeight = parseFloat(svg.getAttribute("data-row-height") || "0");
    const marginLeft = parseFloat(svg.getAttribute("data-margin-left") || "0");
    const marginRight = parseFloat(svg.getAttribute("data-margin-right") || "0");

    let svgWidth = parseFloat(svg.getAttribute("width") || "0");
    let svgHeight = parseFloat(svg.getAttribute("height") || "0");
    if ((!svgWidth || !svgHeight) && svg.viewBox && svg.viewBox.baseVal) {
        svgWidth = svg.viewBox.baseVal.width;
        svgHeight = svg.viewBox.baseVal.height;
    }

    const colStartX = (svg.getAttribute("data-col-start-x") || "")
        .split(",")
        .filter(s => s !== "")
        .map(parseFloat);
    const colEndX = (svg.getAttribute("data-col-end-x") || "")
        .split(",")
        .filter(s => s !== "")
        .map(parseFloat);

    if (!rows || !cols || !rowHeight || colStartX.length !== cols || colEndX.length !== cols) {
        console.error("SVGhighlight: missing or invalid layout metadata on <svg>.");
        return;
    }

    // Resolve highlight color
    const palette = window.colorPalette || {};
    const colorVal = palette[colorKey] || palette.TeaHalf || "rgba(221,232,185,0.5)";

    const k = String(kind || "").toLowerCase();

    let rowIndex = null;
    let colIndex = null;

    if (k === "row") {
        rowIndex = Number(target);
        if (!(rowIndex >= 0 && rowIndex < rows)) {
            console.error("SVGhighlight: row index out of range:", rowIndex);
            return;
        }
    } else if (k === "col" || k === "column") {
        colIndex = Number(target);
        if (!(colIndex >= 0 && colIndex < cols)) {
            console.error("SVGhighlight: column index out of range:", colIndex);
            return;
        }
    } else if (k === "cell") {
        if (Array.isArray(target) && target.length === 2) {
            rowIndex = Number(target[0]);
            colIndex = Number(target[1]);
        } else {
            console.error("SVGhighlight: for 'Cell', target must be [rowIndex, colIndex].");
            return;
        }
        if (!(rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < cols)) {
            console.error("SVGhighlight: cell indices out of range:", target);
            return;
        }
    } else {
        console.error("SVGhighlight: kind must be 'Row', 'Col', or 'Cell'.");
        return;
    }

    // Compute overlay geometry
    let x, y, width, height;

    if (k === "row") {
        const rowTop = headerDividerY + rowHeight * rowIndex;
        x = marginLeft;
        y = rowTop;
        width = svgWidth - marginLeft - marginRight;
        height = rowHeight;
    } else if (k === "col" || k === "column") {
        x = colStartX[colIndex];
        y = headerDividerY;
        width = colEndX[colIndex] - colStartX[colIndex];
        height = rowHeight * rows;
    } else { // cell
        const rowTop = headerDividerY + rowHeight * rowIndex;
        x = colStartX[colIndex];
        y = rowTop;
        width = colEndX[colIndex] - colStartX[colIndex];
        height = rowHeight;
    }

    const svgns = "http://www.w3.org/2000/svg";
    const overlay = document.createElementNS(svgns, "rect");
    overlay.setAttribute("x", String(x));
    overlay.setAttribute("y", String(y));
    overlay.setAttribute("width", String(width));
    overlay.setAttribute("height", String(height));
    overlay.setAttribute("fill", colorVal);
    overlay.setAttribute("fill-opacity", "1"); // we’ll control visible alpha via CSS opacity
    overlay.setAttribute("data-svg-highlight", "1");
    overlay.style.pointerEvents = "none";

    // Fade settings
    const fadeDurationMs = 400; // fade-in / fade-out duration
    overlay.style.opacity = "0";
    overlay.style.transition = `opacity ${fadeDurationMs}ms ease`;

    svg.appendChild(overlay);

    // Fade-in (next animation frame)
    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
    });

    // Optional fade-out and removal
    if (typeof durationMs === "number" && durationMs > 0) {
        const visibleTime = durationMs;

        setTimeout(() => {
            // start fade-out
            overlay.style.opacity = "0";

            // remove after fade-out completes
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, fadeDurationMs);
        }, visibleTime);
    }
}

/**
 * SVGclearHighlights
 * Remove all SVGhighlight overlays from a given Storyline shape.
 *
 * @param {string} containerName  Storyline acc name, e.g. "rect1"
 */
function SVGclearHighlights(containerName) {
    const name = String(containerName);

    const container = document.querySelector(`[data-acc-text='${name}']`);
    if (!container) {
        console.error(`SVGclearHighlights: container '${name}' not found.`);
        return;
    }

    const svg = container.querySelector("svg");
    if (!svg) {
        console.warn(`SVGclearHighlights: no <svg> found inside container '${name}'.`);
        return;
    }

    const overlays = svg.querySelectorAll("rect[data-svg-highlight='1']");
    overlays.forEach(node => {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });
}



// End SVG Functionality











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

    //if (!window._tabulatorTables) window._tabulatorTables = {};
        //window._tabulatorTables[containerID] = table;

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

function initDynamicFormattedTableWithFontSize(
    containerName,
    dataOrUrl,
    ColumnNames,
    FormatArray,
    columnHeaders = null,
    firstColumnWidth = null,
    fontSizePx = 12 // new parameter: force a specific font size
) {
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
    container.appendChild(tableContainer);

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

        if (typeof firstColumnWidth === "number" && idx === 0) {
            columnDef.width = firstColumnWidth;
        } else if (Array.isArray(firstColumnWidth) && firstColumnWidth[idx] !== undefined) {
            columnDef.width = firstColumnWidth[idx];
        }

        return columnDef;
    });

    console.log("Final Columns with Calculated Widths:", finalColumns);

    // Create style tag for Tabulator, force font size everywhere (rows + headers)
    const style = document.createElement("style");
    style.textContent = `
        [data-acc-text='${containerName}'] .tabulator {
            font-size: ${fontSizePx}px !important;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-row {
            height: auto;
            border-top: 2px solid #aaa;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-cell {
            font-size: ${fontSizePx}px !important;
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header .tabulator-col {
            font-size: ${fontSizePx}px !important; /* force header font size */
        }

        [data-acc-text='${containerName}'] .tabulator .tabulator-header {
            border-bottom: none !important;
        }
    `;
    document.head.appendChild(style);

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


/* =======================================================================
   Storyline DOM-Safe Replay Fix — single chart/table per shape (global)
   Paste at END of globalAssets.js. No slide changes needed.
   ======================================================================= */
(function SL_ReplayFix(){
  if (window.__SL_REPLAY_FIX_PATCHED__) return;
  window.__SL_REPLAY_FIX_PATCHED__ = true;

  // ---- helpers ----------------------------------------------------------
  function findShapeContainer(el){
    let cur = el;
    for (let i=0; i<12 && cur; i++){
      if (cur.nodeType===1 && cur.hasAttribute?.('data-acc-text')) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function destroyChartOnCanvas(canvas){
    try {
      const inst = window.Chart?.getChart?.(canvas);
      if (inst?.destroy) inst.destroy();
    } catch(e){}
  }

  function removeCanvasAndEmptyWrapper(canvas){
    try {
      const p = canvas.parentElement;
      destroyChartOnCanvas(canvas);
      canvas.remove();
      if (p && p.childElementCount === 0) {
        // clean up common wrappers your slides add
        const cls = (p.classList || {});
        if (cls.contains?.('chart-view') || cls.contains?.('slife-wrap') || p.tagName === 'DIV') {
          p.remove();
        }
      }
    } catch(e){}
  }

  function purgeOldCanvasesInShape(shape){
    // Remove ALL existing canvases in this shape (we call this BEFORE adding the new one)
    const canvases = shape.querySelectorAll('canvas');
    canvases.forEach(removeCanvasAndEmptyWrapper);
  }

  function purgeOldTabulatorsInShape(shape){
    // Destroy/remove any existing Tabulator roots inside the same shape
    const roots = shape.querySelectorAll('.tabulator');
    roots.forEach(root => {
      try { root.parentElement?._tabulator?.destroy?.(); } catch(e){}
      try { root.remove(); } catch(e){}
    });
  }

  function nodeContainsCanvas(node){
    try {
      if (!node) return false;
      if (node.nodeType === 1 && node.tagName === 'CANVAS') return true;
      if (typeof node.querySelector === 'function') return !!node.querySelector('canvas');
      return false;
    } catch(e){ return false; }
  }

  function nodeContainsTabulator(node){
    try {
      if (!node) return false;
      if (node.nodeType === 1 && node.classList?.contains('tabulator')) return true;
      if (typeof node.querySelector === 'function') return !!node.querySelector('.tabulator');
      return false;
    } catch(e){ return false; }
  }

  // ---- patch DOM insertion methods (append/insert/replace) --------------
  const _appendChild  = Element.prototype.appendChild;
  const _insertBefore = Element.prototype.insertBefore;
  const _replaceChild = Element.prototype.replaceChild;

  function beforeInsert(container, node){
    // We only act when the node being inserted carries a canvas or a Tabulator root.
    const shape = findShapeContainer(container);
    if (!shape) return;

    let needsCanvasPurge = nodeContainsCanvas(node);
    let needsTabPurge    = nodeContainsTabulator(node);

    if (needsCanvasPurge) purgeOldCanvasesInShape(shape);
    if (needsTabPurge)    purgeOldTabulatorsInShape(shape);
  }

  Element.prototype.appendChild = function(child){
    try { beforeInsert(this, child); } catch(e){}
    return _appendChild.call(this, child);
  };

  Element.prototype.insertBefore = function(newNode, refNode){
    try { beforeInsert(this, newNode); } catch(e){}
    return _insertBefore.call(this, newNode, refNode);
  };

  Element.prototype.replaceChild = function(newChild, oldChild){
    try { beforeInsert(this, newChild); } catch(e){}
    return _replaceChild.call(this, newChild, oldChild);
  };

  // ---- Chart.js safe defaults (optional, harmless if Chart not loaded yet)
  (function waitForChart(attempts){
    if (window.Chart?.version) {
      try {
        Chart.defaults.maintainAspectRatio = false;
        if (Chart.defaults.animation && typeof Chart.defaults.animation === 'object') {
          Chart.defaults.animation.duration = 1200;
        }
        // If you ever see blurriness under player scaling, you can also set:
        // Chart.defaults.devicePixelRatio = 1;
      } catch(e){}
      return;
    }
    if (attempts <= 0) return;
    setTimeout(() => waitForChart(attempts - 1), 50);
  })(200);
})();


(function (global) {
  function getTableFromShape(rectId) {
    const container = document.querySelector(`[data-acc-text='${rectId}']`);
    return container ? container._tabulatorTable : null;
  }

  // Update a single cell by row index
  function updateCellByIndex(rectId, rowIndex, columnField, newValue) {
    const table = getTableFromShape(rectId);
    if (!table) return;

    const rows = table.getRows();
    const row = rows[rowIndex];
    if (row) {
      row.update({ [columnField]: newValue });
    }
  }

  // Expose globally
  global.updateCellByIndex = updateCellByIndex;
})(window);

