const form = document.getElementById('csv-loader');
const fileInput = document.getElementById('csv-file-input');
const columnSelector = document.getElementById('column-select');
const valueSelector = document.getElementById('value-select');
const tableHeader = document.getElementById('data-table-header');
const tableBody = document.getElementById('data-table-body');
let trades;

const reader = new FileReader();

const createTableRow = (values, cellType) => {
  const row = document.createElement('tr');
  values.forEach(value => {
    const cell = document.createElement(cellType);
    cell.innerText = value;
    row.appendChild(cell);
  });

  return row;
};

const optionCreator = (value) => {
  const option = document.createElement('option');
  option.value = value;
  option.innerText = value;
  option.selected = value.toLowerCase() === 'account';
  return option;
};

const generateOptions = (parent, options) => {
  options.forEach((option) => {
    parent.appendChild(optionCreator(option));
  });
};

const generateValueOptions = (columnName) => {
  const columnValues = trades.reduce((result, trade) => {
    const value = trade[columnName];
    if (!result.includes(value)) {
      result.push(value);
    }

    return result;
  }, []);

  valueSelector.innerHTML = null;
  generateOptions(valueSelector, columnValues);
};

const filterData = () => {
  const columnName = columnSelector.value;
  const columnValue = valueSelector.value;

  return trades.filter(trade => {
    return trade[columnName] === columnValue;
  });
}

const displayData = () => {
  const data = filterData();
  tableBody.innerHTML = null;

  data.forEach(trade => {
    const values = Object.values(trade);
    const row = createTableRow(values, 'td');
    tableBody.appendChild(row);
  });

  // TODO: Make a csv string and export into a .csv file
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  reader.readAsText(file);
});

columnSelector.addEventListener('change', (e) => {
  const columnName = e.target.value;
  generateValueOptions(columnName);
});

reader.addEventListener('load', (e) => {
  const content = e.target.result;
  const lines = content.split('\r\n').slice(0, -1); // TODO: Maybe do a safer c heck if this is an empty line at the end of file
  const headerLine = lines[0].endsWith(',') && lines[0].slice(0, -1) || lines[0];
  const columns = headerLine.split(',');
  const tableHeaderRow = createTableRow(columns, 'th');

  tableHeader.appendChild(tableHeaderRow);

  trades = lines.slice(1).map(trade => {
    const tradeValues = trade.slice(0, -1).split(',');
    const tradeObject = {};

    columns.forEach((column, index) => {
      tradeObject[column] = tradeValues[index];
    });

    return tradeObject;
  });

  generateOptions(columnSelector, columns);
  generateValueOptions(columnSelector.value);
  displayData();
});

[columnSelector, valueSelector].forEach(selector => selector.addEventListener('change', displayData));
