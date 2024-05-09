window.addEventListener('load', () => {
  const form = document.getElementById('csv-loader');
  const fileInput = document.getElementById('csv-file-input');
  const filterOptionsContainer = document.getElementById('filter-options');
  // const columnSelector = document.getElementById('column-select');
  // const valueSelector = document.getElementById('value-select');
  const tableHeader = document.getElementById('data-table-header');
  const tableBody = document.getElementById('data-table-body');

  const filterBy = ['Account', 'Symbol'];

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

  const filterUpdated = (e) => {
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
    console.log('filterOptions', JSON.stringify(filterOptions, null, 2));
  };

  filterOptionsContainer.addEventListener('click', filterUpdated);

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

  // const optionCreator = (value) => {
  //   const option = document.createElement('option');
  //   option.value = value;
  //   option.innerText = value;
  //   option.selected = value.toLowerCase() === 'account';
  //   return option;
  // };
  //
  // const generateOptions = (parent, options) => {
  //   options.forEach((option) => {
  //     parent.appendChild(optionCreator(option));
  //   });
  // };
  //
  // const generateValueOptions = (columnName) => {
  //   const columnValues = trades.reduce((result, trade) => {
  //     const value = trade[columnName];
  //     if (!result.includes(value)) {
  //       result.push(value);
  //     }
  //
  //     return result;
  //   }, []);
  //
  //   valueSelector.innerHTML = null;
  //   generateOptions(valueSelector, columnValues);
  // };
  //
  // const filterData = (trades) => {
  //   const columnName = columnSelector.value;
  //   const columnValue = valueSelector.value;
  //
  //   return trades.filter(trade => trade[columnName] === columnValue);
  // }
  //
  // const displayData = (trades) => {
  //   const data = filterData(trades);
  //   tableBody.innerHTML = null;
  //
  //   data.forEach(trade => {
  //     const values = Object.values(trade);
  //     const row = createTableRow(values, 'td');
  //     tableBody.appendChild(row);
  //   });
  //
  //   // TODO: Make a csv string and export into a .csv file
  // };
  //
  // columnSelector.addEventListener('change', (e) => {
  //   const columnName = e.target.value;
  //   generateValueOptions(columnName);
  // });

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

  reader.addEventListener('load', (e) => {
    clear();

    const content = e.target.result;
    const lines = content.split('\r\n').slice(0, -1); // TODO: Maybe do a safer check if this is an empty line at the end of file
    const headerLine = lines[0].endsWith(',') && lines[0].slice(0, -1) || lines[0];
    const columns = headerLine.split(',');
    const tableHeaderRow = createTableRow(columns, 'th');

    tableHeader.appendChild(tableHeaderRow);

    const trades = getTrades(columns, lines);

    // generateOptions(columnSelector, columns);
    // generateValueOptions(columnSelector.value);
    // displayData(trades);
    filterBy.forEach(filter => {
      const options = columns.includes(filter) && getValuesFor(filter, trades);
      filterOptionsContainer.appendChild(addFilter(filter, options));
    });
  });

  // [columnSelector, valueSelector].forEach(selector => selector.addEventListener('change', displayData));
});
