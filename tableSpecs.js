// tableSpecs.js

const tableDefinitions = {
    IOF: {
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
                if (rowIndex === 0) {
                    return formatFunctions.Text(cell.getValue()); // Row 1: plain text
                } else if (rowIndex === 1) {
                    return formatFunctions.SpecialDate(cell.getValue()); // Row 2: SpecialDate
                } else if (rowIndex === 2) {
                    return formatFunctions.Dec4(cell.getValue()); // Row 3: Dec4
                }
                return cell.getValue(); // Default case
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
      // Additional table specifications go here, as needed
};
