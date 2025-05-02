const calFormatter = function(cell) {
    const value = cell.getValue();
    if (value === "") return "";  // If no value, return empty string to avoid rendering

    return `<span style="
        font-size: 12px;
        line-height: 18px;  // Adjusted to ensure vertical centering
        height: 18px;  // Ensures content fits within the row height
        display: inline-block;
        padding: 0;
        margin: 0;
        overflow: hidden;  // Prevent content from overflowing the cell
        vertical-align: middle;  // Vertically align the content in the middle of the row
        text-align: center;  // Center the text horizontally
    ">${Math.round(value)}</span>`;
}

window.tableDefinitions = {
    IOFInt: {
        tableOptions: {
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false
            }
        },
        columns: [
            { title: "ID", field: "ID", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Ticker", field: "Ticker", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Country", field: "Country", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Local Price", field: "LocalPrice", headerSort: false, formatter: cell => formatFunctions.Dec2(cell.getValue()) },
            { title: "Currency", field: "Currency", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "FX", field: "FX", headerSort: false, formatter: cell => formatFunctions.Dec2(cell.getValue()) },
            { title: "Base Price", field: "BasePrice", headerSort: false, formatter: cell => formatFunctions.Dollar2(cell.getValue()) },
            { title: "Weight", field: "Weight", headerSort: false, formatter: cell => formatFunctions.Perc2(cell.getValue()) },
            { title: "Index Shares", field: "IndexShares", headerSort: false, formatter: cell => formatFunctions.Dec4(cell.getValue()) },
            { title: "Index Value", field: "IndexValue", headerSort: false, formatter: cell => formatFunctions.Dec4(cell.getValue()) }
        ]
    },
    IOF: {
        tableOptions: {
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false
            }
        },
        columns: [
            { title: "ID", field: "ID", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Ticker", field: "Ticker", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Base Price", field: "BasePrice", headerSort: false, formatter: cell => formatFunctions.Dollar2(cell.getValue()) },
            { title: "Weight", field: "Weight", headerSort: false, formatter: cell => formatFunctions.Perc2(cell.getValue()) },
            { title: "Index Shares", field: "IndexShares", headerSort: false, formatter: cell => formatFunctions.Dec4(cell.getValue()) },
            { title: "Index Value", field: "IndexValue", headerSort: false, formatter: cell => formatFunctions.Dec4(cell.getValue()) }
        ]
    },
    MC2: {
        tableOptions: {
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false
            }
        },
        columns: [
            { title: "Quantity", field: "Col1", headerSort: false, formatter: cell => formatFunctions.Dec0(cell.getValue()) },
            { title: "Name", field: "Col2", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Unit Price", field: "Col3", headerSort: false, formatter: cell => formatFunctions.Dollar2(cell.getValue()) },
            { title: "Discount", field: "Col4", headerSort: false, formatter: cell => formatFunctions.Dec0(cell.getValue()) },
            { title: "Category", field: "Col5", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Total", field: "Col6", headerSort: false, formatter: cell => formatFunctions.Dollar0(cell.getValue()) }
        ]
    },
    TwoColCustom: {
        tableOptions: {
            layout: "fitColumns",
            columnDefaults: {
                headerSort: false
            }
        },
        columns: [
            { title: "", field: "Col1", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { 
                title: "", field: "Col2", headerSort: false, 
                formatter: (cell) => {
                    const rowIndex = cell.getRow().getPosition(true);
                    const formatMap = cell.getTable()._col2FormatArray;
                    const formatType = formatMap?.[rowIndex] || "Text";
                    const formatterFn = formatFunctions[formatType] || formatFunctions.Text;
                    return formatterFn(cell.getValue());
                }
            }
        ]
    },
    TwoColDec4: {
        columns: [
            { field: "Col1", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { field: "Col2", headerSort: false, formatter: cell => formatFunctions.Dec4(cell.getValue()), hozAlign: "right" }
        ],
        tableOptions: {
            layout: "fitDataStretch",
            rowFormatter: function(row) {
                const el = row.getElement();
                el.style.height = "18px";
                el.style.lineHeight = "1.2";
                el.style.fontSize = "12px";
                el.style.padding = "0";
                el.style.margin = "0";
            },
            columnDefaults: {
                headerSort: false,
                resizable: false
            }
        }
    },
    IndexHeader: {
        tableOptions: {
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false
            }
        },
        columns: [
            { title: "", field: "Col1", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { 
                title: "", field: "Col2", headerSort: false, 
                formatter: (cell, rowIndex) => {
                    if (rowIndex === 0) {
                        return formatFunctions.Text(cell.getValue());
                    } else if (rowIndex === 1) {
                        return formatFunctions.SpecialDate(cell.getValue());
                    } else if (rowIndex === 2) {
                        return formatFunctions.Dec4(cell.getValue());
                    }
                    return cell.getValue();
                }
            }
        ]
    },
    Cal: {
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
            rowFormatter: function(row) {
                row.getElement().style.height = "18px";
                row.getElement().style.lineHeight = "18px";
                row.getElement().style.fontSize = "12px";
                row.getElement().style.padding = "0";
                row.getElement().style.margin = "0";
                row.getElement().style.textAlign = "center";
            },
            columnDefaults: {
                headerSort: false,
                resizable: false
            }
        }
    },
    MarketCap: {
        columns: [
            { title: "Ticker", field: "Ticker", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "Market Cap", field: "MC", headerSort: false, hozAlign: "right", formatter: cell => formatFunctions.Dollar0(cell.getValue()) }
        ],
        tableOptions: {
            layout: "fitDataStretch",
            rowFormatter: row => {
                const el = row.getElement();
                el.style.height = "18px";
                el.style.lineHeight = "1";
                el.style.fontSize = "12px";
                el.style.padding = "0";
                el.style.margin = "0";
            },
            columnDefaults: {
                headerSort: false,
                resizable: false
            }
        }
    },
    JustText5: {
        columns: Array.from({ length: 5 }, (_, i) => ({
            title: "",
            field: `Col${i + 1}`,
            headerSort: false,
            formatter: cell => formatFunctions.Text(cell.getValue())
        })),
        tableOptions: {
            layout: "fitDataStretch",
            rowFormatter: row => {
                const el = row.getElement();
                el.style.height = "18px";
                el.style.lineHeight = "1.2";
                el.style.fontSize = "12px";
                el.style.padding = "0";
                el.style.margin = "0";
            },
            columnDefaults: {
                headerSort: false,
                resizable: false
            }
        }
    },
    JustText2: {
        columns: Array.from({ length: 2 }, (_, i) => ({
            title: "",
            field: `Col${i + 1}`,
            headerSort: false,
            formatter: cell => formatFunctions.Text(cell.getValue())
        })),
        tableOptions: {
            layout: "fitDataStretch",
            rowFormatter: row => {
                const el = row.getElement();
                el.style.height = "18px";
                el.style.lineHeight = "1.2";
                el.style.fontSize = "12px";
                el.style.padding = "0";
                el.style.margin = "0";
            },
            columnDefaults: {
                headerSort: false,
                resizable: false
            }
        }
    }
};
