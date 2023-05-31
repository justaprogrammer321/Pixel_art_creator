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