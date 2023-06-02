const gridContainer = document.getElementById('grid-container');
let selectedColor = '#000'; // Default selected color
let mouseDown = false; // Variable to track mouse button state
let isEraserActive = false; // Variable to track eraser state
let cellStates = []; // Array to store cell colors for undo and redo
let currentStateIndex = -1; // Index of current state in cellStates array

for (let i = 0; i < 64; i++) {
  for (let j = 0; j < 64; j++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    cell.dataset.number = i * 64 + j + 1; // Assign a number to the cell using data attribute

    // Add event listeners for mouse events
    cell.addEventListener('mousedown', () => {
      mouseDown = true;
      updateCellColor(cell); // Set the selected color to the clicked cell or erase it
    });

    cell.addEventListener('mousemove', () => {
      if (mouseDown) {
        updateCellColor(cell); // Set the selected color to the cell while mouse button is down or erase it
      }
    });

    cell.addEventListener('mouseup', () => {
      mouseDown = false;
    });

    gridContainer.appendChild(cell);
  }
}

 function updateColor() {
      const colorPicker = document.getElementById('color-picker');
      const newColor = colorPicker.value;
      updateSelectedColor(newColor);
 }

// Function to update the selected color or toggle eraser state
function updateSelectedColor(color) {
  if (isEraserActive) {
    toggleEraser(); // Deactivate eraser if color is selected
  } else {
    selectedColor = color;
  }
}

// Function to update the cell color and store state for undo/redo
function updateCellColor(cell) {
  const color = cell.style.backgroundColor;
  if (isEraserActive) {
    cell.style.backgroundColor = ''; // Erase the cell
  } else {
    cell.style.backgroundColor = selectedColor; // Set the selected color to the cell
  }
  storeCellState(cell, color);
}

// Function to store cell state for undo/redo
function storeCellState(cell, prevColor) {
  currentStateIndex++;
  if (currentStateIndex < cellStates.length) {
    cellStates.splice(currentStateIndex);
  }
  cellStates.push({ cell, prevColor });
}

// Add event listener for color picker change event
const colorPicker = document.getElementById('color-picker');
colorPicker.addEventListener('change', () => {
  updateSelectedColor(colorPicker.value);
});

// Function to toggle eraser state
function toggleEraser() {
  const eraserButton = document.querySelector('button');
  isEraserActive = !isEraserActive;
  if (isEraserActive) {
    eraserButton.style.fontWeight = 'bold';
  } else {
    eraserButton.style.fontWeight = 'normal';
  }
}

// Add event listener for undo shortcut (Ctrl+Z)
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'z') {
    event.preventDefault();
    undo();
  }
});

// Add event listener for redo shortcut (Ctrl+Shift+Z)
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
    event.preventDefault();
    redo();
  }
});

// Function to undo the previous cell state
function undo() {
  if (currentStateIndex >= 0) {
    const { cell, prevColor } = cellStates[currentStateIndex];
    cell.style.backgroundColor = prevColor;
    currentStateIndex--;
  }
}

// Function to redo the next cell state
function redo() {
  if (currentStateIndex < cellStates.length - 1) {
    currentStateIndex++;
    const { cell, prevColor } = cellStates[currentStateIndex];
    cell.style.backgroundColor = selectedColor;
  }
}

// Function to download the grid as an image
function downloadGrid() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const cellSize = 10; // Size of each cell
  const gridGap = 0; // Gap between cells
  const gridBorder = 0; // Border thickness

  const gridWidth = 64 * cellSize + (63 * gridGap) + (2 * gridBorder);
  const gridHeight = 64 * cellSize + (63 * gridGap) + (2 * gridBorder);

  canvas.width = gridWidth;
  canvas.height = gridHeight;

  ctx.fillStyle = '#fff'; // Set canvas background color
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64; j++) {
      const cell = document.querySelector(
        `.grid-cell:nth-child(${i * 64 + j + 1})`
      );
      const cellColor = cell.style.backgroundColor;

      if (cellColor) {
        ctx.fillStyle = cellColor;
        ctx.fillRect(
          j * (cellSize + gridGap) + gridBorder,
          i * (cellSize + gridGap) + gridBorder,
          cellSize,
          cellSize
        );
      }
    }
  }

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'grid.png';
  link.click();
}

function downloadGridJSON() {
  let gridData = [];

  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64; j++) {
      const cell = document.querySelector(`.grid-cell[data-number="${i * 64 + j + 1}"]`);
      const cellColor = cell.style.backgroundColor || 'transparent';

      gridData.push({ number: i * 64 + j + 1, color: cellColor });
    }
  }

  const jsonData = JSON.stringify(gridData, null, 2);

  const link = document.createElement('a');
  const blob = new Blob([jsonData], { type: 'application/json' });
  link.href = URL.createObjectURL(blob);
  link.download = 'grid_data.json';
  link.click();
}

// // Function to read and apply the grid data from a JSON file
// function uploadJSONGrid() {
//   const fileInput = document.getElementById('json-file-input');
//   const file = fileInput.files[0];

//   const reader = new FileReader();
//   reader.onload = function (e) {
//     const contents = e.target.result;
//     const gridData = JSON.parse(contents);

//     gridData.forEach((cellData) => {
//       const { number, color } = cellData;
//       const cell = document.querySelector(`.grid-cell[data-number="${number}"]`);
//       cell.style.backgroundColor = color;
//     });
//   };
//   reader.readAsText(file);
// }
let layers = [];

// Function to read and apply the grid data from a JSON file with layer option
function uploadJSONGridWithLayer() {
  const fileInput = document.getElementById('json-file-input');
  const file = fileInput.files[0];

  const reader = new FileReader();
  reader.onload = function (e) {
    const contents = e.target.result;
    const gridData = JSON.parse(contents);

    const layerOption = document.getElementById('layer-option').value;
    const newLayer = [];

    if (layerOption === 'over') {
      // Place the new layer above the previous layers
      newLayer.push(...gridData);
      layers.unshift(newLayer);
    } else if (layerOption === 'under') {
      // Place the new layer below the previous layers
      newLayer.push(...gridData);
      layers.push(newLayer);
    }

    // Apply the grid data from all layers to the grid
    updateGridFromLayers();
  };
  reader.readAsText(file);
}

// Function to update the grid from all layers
function updateGridFromLayers() {
  clearGrid(); // Clear the grid

  // Iterate through all layers and apply the colors to the grid
  layers.forEach((layer) => {
    layer.forEach((cellData) => {
      const { number, color } = cellData;
      const cell = document.querySelector(`.grid-cell[data-number="${number}"]`);
      
      // Apply the color based on layer order
      if (cell.style.backgroundColor === '' || cell.style.backgroundColor === 'transparent') {
        cell.style.backgroundColor = color;
      }
    });
  });
}

// Function to clear the grid
function clearGrid() {
  const cells = document.getElementsByClassName('grid-cell');
  Array.from(cells).forEach((cell) => {
    cell.style.backgroundColor = '';
  });
}
