function calFormatter(cell) {
    const value = cell.getValue();
    if (value === "") return "";
    return `<span style="
  font-size:12px;
  line-height:12px;
  height:12px;
  display:inline-block;
  padding:0;
  margin:0;
  overflow:hidden;
  vertical-align:middle;
">${Math.round(value)}</span>`;

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
            row.getElement().style.height = "25px";  // Adjust this to fit your rect height and row count
            row.getElement().style.lineHeight = "1";
            row.getElement().style.fontSize = "12px";
            row.getElement().style.padding = "0";
            row.getElement().style.margin = "0";
        },
        columnDefaults: {
            headerSort: false,
            resizable: false
        }
    }
}

  // Make sure there's no trailing comma here
};

