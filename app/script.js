const form = document.getElementById('csv-loader');
const input = document.getElementById('csv-file-input');
const columnSelector = document.getElementById('column-select');
const valueSelector = document.getElementById('value-select');

const reader = new FileReader();

const optionCreator = (value) => {
  const option = document.createElement('option');
  option.value = value;
  option.innerText = value;
  return option;
};

const generateOptions = (parent, options) => {
  options.forEach(option => {
    parent.appendChild(optionCreator(option));
  });
};

reader.addEventListener('load', (e) => {
  const content = e.target.result;
  const lines = content.split('\r\n').slice(0, -1); // TODO: Maybe do a safer c heck if this is an empty line at the end of file
  const headerLine = lines[0].endsWith(',') && lines[0].slice(0, -1) || lines[0];
  const columns = headerLine.split(',');

  const trades = lines.slice(1).map(trade => {
    const tradeValues = trade.slice(0, -1).split(',');
    const tradeObject = {};

    columns.forEach((column, index) => {
      tradeObject[column] = tradeValues[index];
    });

    return tradeObject;
  });

  // TODO: Now that we have trades as objects where props and values are matched, we can create a select filters where
  //  we can allow to filter by a specific value of a prop
  console.log({ trades });

  generateOptions(columnSelector, columns);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const file = input.files[0];
  reader.readAsText(file);
});
