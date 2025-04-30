function calFormatter(cell) {
    const value = cell.getValue();
    if (value === "") {
        return "";
    }
    return `<span style="font-size:14px; line-height:1; padding:0; margin:0;">${Math.round(value)}</span>`;
}


window.tableDefinitions = {
    IOF: {
        tableOptions: {
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false,
                formatterParams: {
                    style: "font-size: 12px;"
                }
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
    IndexHeader: {
        tableOptions: {
            layout: "fitColumns", 
            columnDefaults: {
                headerSort: false,
                formatterParams: {
                    style: "font-size: 12px;"
                }
            }
        },
        columns: [
            { title: "", field: "Col1", headerSort: false, formatter: cell => formatFunctions.Text(cell.getValue()) },
            { title: "", field: "Col2", headerSort: false, formatter: (cell, rowIndex) => {
                if (rowIndex === 0) {
                    return formatFunctions.Text(cell.getValue());
                } else if (rowIndex === 1) {
                    return formatFunctions.SpecialDate(cell.getValue());
                } else if (rowIndex === 2) {
                    return formatFunctions.Dec4(cell.getValue());
                }
                return cell.getValue();
            }}
        ]
    },
    "Cal": {
    columns: [
        { title: "", field: "Sun", headerSort: false, hozAlign: "center", formatter: calFormatter, formatterParams: { allowHtml: true } },
        { title: "", field: "Mon", headerSort: false, hozAlign: "center", formatter: calFormatter, formatterParams: { allowHtml: true }  },
        { title: "", field: "Tues", headerSort: false, hozAlign: "center", formatter: calFormatter, formatterParams: { allowHtml: true }  },
        { title: "", field: "Wed", headerSort: false, hozAlign: "center", formatter: calFormatter, formatterParams: { allowHtml: true }  },
        { title: "", field: "Thurs", headerSort: false, hozAlign: "center", formatter: calFormatter, formatterParams: { allowHtml: true }  },
        { title: "", field: "Fri", headerSort: false, hozAlign: "center", formatter: calFormatter, formatterParams: { allowHtml: true }  },
        { title: "", field: "Sat", headerSort: false, hozAlign: "center", formatter: calFormatter, formatterParams: { allowHtml: true }  }
    ],
    tableOptions: {
        layout: "fitDataStretch",
        height: "170px",         // Ensures room for all 7 rows
        rowHeight: 20,           // Set the row height explicitly
        columnDefaults: {
            headerSort: false,
            resizable: false
        }
    }
}
  // Make sure there's no trailing comma here
};

