window.addEventListener('load', () => {
  const form = document.getElementById('csv-loader');
  const fileInput = document.getElementById('csv-file-input');
  const fileNameContainer = document.getElementById('csv-file-name');
  const filterContainerTitle = document.getElementById('filters-section-title');
  const filters = document.getElementById('filters');
  const tableHeader = document.getElementById('data-table-header');
  const tableBody = document.getElementById('data-table-body');
  const dataDownloadContainer = document.getElementById('data-download');

  const filterBy = ['Account', 'Symbol'];
  let trades = [];

  const createFilterOptions = (filterOptions) => {
    const filterObject = {};
    filterOptions.forEach(filter => filterObject[filter] = []);
    return filterObject;
  };

  const filterOptions = createFilterOptions(filterBy);

  const reader = new FileReader();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    reader.readAsText(file);
  });

  const downloadDataHandler = (e) => {
    if (e.target.tagName === 'A') {
      const data = getFilteredData();
      const columns = Object.keys(data[0]);
      const firstLine = `${columns.join(',')},\n`;

      const output = data.reduce((result, trade) => {
        const dataRow = columns.reduce((row, column) => {
          if (row) {
            return `${row},${trade[column]}`;
          }

          return trade[column];
        }, '');

        return `${result}${dataRow},\n`;
      }, firstLine);

      const filterInfo = Object.entries(filterOptions)
        .map(([ key, value ]) => value.length > 0 ? `${key}_${value.join('+')}` : '')
        .filter(Boolean);

      const filterInfoString = filterInfo.length > 1 ? filterInfo.join('&') : filterInfo[0];

      const blob = new Blob([output], { type: 'text/csv;charset=utf-8,' });
      const dataUrl = URL.createObjectURL(blob);
      e.target.setAttribute('href', dataUrl);
      e.target.setAttribute('download', `Trades_${filterInfoString}.csv`);
    }
  };

  dataDownloadContainer.addEventListener('click', downloadDataHandler);

  const filterIsUpdated = (e) => {
    const { type, name, value, checked } = e.target;

    if (type !== 'checkbox') {
      return;
    }

    const filterOption = filterOptions[name];

    if (checked) {
      filterOption.push(value);
    } else {
      const indexOfValue = filterOption.indexOf(value);
      filterOption.splice(indexOfValue, 1);
    }

    const data = getFilteredData();
    displayData(data);
  };

  filters.addEventListener('click', filterIsUpdated);

  const clear = () => {
    tableHeader.innerHTML = null;
    tableBody.innerHTML = null;
    filters.innerHTML = null;
    filterContainerTitle.innerText = '';
    filterBy.forEach(filter => filterOptions[filter] = []);
  };

  const createTableRow = (values, cellType) => {
    const row = document.createElement('tr');
    values.forEach(value => {
      const cell = document.createElement(cellType);
      cell.innerText = value;
      row.appendChild(cell);
    });

    row.style.gridTemplateColumns = `repeat(${values.length}, 1fr)`;

    return row;
  };

  const getFilteredData = () => {
    const filteringBy = filterBy.filter(prop => filterOptions[prop].length > 0);

    return trades.filter(trade => {
      return filteringBy.every(prop => {
        return filterOptions[prop].includes(trade[prop]);
      });
    });
  }

  const displayData = (data) => {
    tableBody.innerHTML = null;

    data.forEach(trade => {
      const values = Object.values(trade);
      const row = createTableRow(values, 'td');
      tableBody.appendChild(row);
    });

    addDataDownloadButton(data);
  };

  const getValuesFor = (columnName, trades) => {
    return trades.reduce((result, trade) => {
      const value = trade[columnName];
      if (!result.includes(value)) {
        result.push(value);
      }

      return result;
    }, []);
  };

  const addFilter = (property, values) => {
    const filterContainer = document.createElement('fieldset');
    const filterContainerLabel = document.createElement('legend');
    const filterContent = document.createElement('div');

    filterContent.classList.add('filter-content', `filter-${property}`);

    filterContainerLabel.innerText = property;
    filterContainer.appendChild(filterContainerLabel);
    filterContainer.appendChild(filterContent);

    values.forEach(value => {
      const label = document.createElement('label');
      const text = document.createElement('span');
      const option = document.createElement('input');

      option.type = 'checkbox';
      option.value = value;
      option.name = property;
      label.appendChild(option);

      text.innerText = value;
      label.appendChild(text);

      filterContent.appendChild(label);
    });

    return filterContainer;
  };

  const getTrades = (columns, data) => {
    return data.slice(1).map(trade => {
      const tradeValues = trade.split(',');
      const tradeObject = {};

      columns.forEach((column, index) => {
        tradeObject[column] = tradeValues[index];
      });

      return tradeObject;
    });
  };

  const addDataDownloadButton = () => {
    dataDownloadContainer.innerHTML = null;

    const button = document.createElement('a');
    button.innerText = 'Download .csv file';
    button.classList.add('download-button');

    dataDownloadContainer.appendChild(button);
  };

  fileInput.addEventListener('change', () => {
    fileNameContainer.innerText = fileInput.value;
  });

  reader.addEventListener('load', (e) => {
    clear();

    const content = e.target.result;
    const separator = content.includes('\r\n') ? ',\r\n' : ',\n';
    const allLines = content.split(separator);
    const linesWithData = allLines[allLines.length - 1] === '' ? allLines.slice(0, -1) : allLines;
    const headerLine = linesWithData[0];
    const columns = headerLine.split(',');
    const tableHeaderRow = createTableRow(columns, 'th');

    tableHeader.appendChild(tableHeaderRow);

    trades = getTrades(columns, linesWithData);

    filterContainerTitle.innerText = 'Filters';
    filterBy.forEach(filter => {
      const options = columns.includes(filter) && getValuesFor(filter, trades);
      filters.appendChild(addFilter(filter, options));
    });

    displayData(trades);
  });
});
