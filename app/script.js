window.addEventListener('load', () => {
  const form = document.getElementById('csv-loader');
  const fileInput = document.getElementById('csv-file-input');
  const filterOptionsContainer = document.getElementById('filter-options');
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
    if (e.target.tagName === 'BUTTON') {
      console.log(JSON.stringify(getFilteredData(), null, 2));
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

  filterOptionsContainer.addEventListener('click', filterIsUpdated);

  const clear = () => {
    tableHeader.innerHTML = null;
    tableBody.innerHTML = null;
    filterOptionsContainer.innerHTML = null;
    filterBy.forEach(filter => filterOptions[filter] = []);
  };

  const createTableRow = (values, cellType) => {
    const row = document.createElement('tr');
    values.forEach(value => {
      const cell = document.createElement(cellType);
      cell.innerText = value;
      row.appendChild(cell);
    });

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
      const tradeValues = trade.slice(0, -1).split(',');
      const tradeObject = {};

      columns.forEach((column, index) => {
        tradeObject[column] = tradeValues[index];
      });

      return tradeObject;
    });
  };

  const addDataDownloadButton = () => {
    dataDownloadContainer.innerHTML = null;

    const button = document.createElement('button');
    button.innerText = 'Download .csv file';

    dataDownloadContainer.appendChild(button);
  };

  reader.addEventListener('load', (e) => {
    clear();

    const content = e.target.result;
    const lines = content.split('\r\n').slice(0, -1); // TODO: Maybe do a safer check if this is an empty line at the end of file
    const headerLine = lines[0].endsWith(',') && lines[0].slice(0, -1) || lines[0];
    const columns = headerLine.split(',');
    const tableHeaderRow = createTableRow(columns, 'th');

    tableHeader.appendChild(tableHeaderRow);

    trades = getTrades(columns, lines);

    filterBy.forEach(filter => {
      const options = columns.includes(filter) && getValuesFor(filter, trades);
      filterOptionsContainer.appendChild(addFilter(filter, options));
    });

    displayData(trades);
  });
});
