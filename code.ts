figma.showUI(__html__);
figma.ui.resize(500, 600);

let currentSelection = figma.currentPage.selection[0];
const validNodeTypes = [
  "BOOLEAN_OPERATION",
  "COMPONENT",
  "ELLIPSE",
  "FRAME",
  "GROUP",
  "HIGHLIGHT",
  "INSTANCE",
  "LINE",
  "POLYGON",
  "RECTANGLE",
  "STAMP",
  "STAR",
  "TEXT",
  "VECTOR",
  "WASHI_TAPE",
];

function displayInvalidSelectionMessage() {
  figma.notify(
    `Please select a valid node or layer type. Like "COMPONENT", "ELLIPSE", "FRAME", "GROUP", "HIGHLIGHT", "INSTANCE", "LINE", "POLYGON", "RECTANGLE",  "STAMP", "STAR", "TEXT", "VECTOR"`,
    {
      timeout: 2000,
    }
  );
}

function handleSelectionChange() {
  currentSelection = figma.currentPage.selection[0];

  if (figma.currentPage.selection.length == 0) {
    displayInvalidSelectionMessage(); 
    figma.ui.postMessage("error");
    return;
  }

  if (!validNodeTypes.includes(currentSelection.type)) {
    displayInvalidSelectionMessage();
    return;
  }

  figma.ui.postMessage(currentSelection.name);
}

// Initial check for the current selection
handleSelectionChange();
figma.on("selectionchange", handleSelectionChange);

figma.ui.onmessage = async (pluginMessage) => {
  const { formData } = pluginMessage;
  await figma
    .loadFontAsync({
      family: "Inter",
      style: "Regular",
    })
    .then(() => {
      // Create the text node - Start
      const text = figma.createText();
      text.fontName = {
        family: "Inter",
        style: "Regular",
      };
      text.characters = formData.tooltipText;
      text.fontSize = parseInt(formData.textSize);
      text.fills = [{ type: "SOLID", color: hexToRgb(formData.textColor) }];
      // Create the text node - End

      // Create the polygon node - Start
      const nib = figma.createPolygon();
      nib.x = currentSelection.x + 100;
      nib.y = currentSelection.y + 100;
      nib.resize(12, 12);
      nib.pointCount = 3;
      nib.cornerRadius = 1;
      nib.fills = [{ type: "SOLID", color: hexToRgb(formData.containerColor) }];
      // Create the polygon node - end

      // create tooltip frame - START
      const tooltipTextFrame = figma.createFrame();
      tooltipTextFrame.layoutMode = "HORIZONTAL";
      tooltipTextFrame.paddingBottom = 4;
      tooltipTextFrame.paddingRight = 6;
      tooltipTextFrame.paddingTop = 4;
      tooltipTextFrame.paddingLeft = 6;
      tooltipTextFrame.cornerRadius = 4;
      tooltipTextFrame.primaryAxisSizingMode = "AUTO";
      tooltipTextFrame.counterAxisSizingMode = "AUTO";
      tooltipTextFrame.fills = [
        { type: "SOLID", color: hexToRgb(formData.containerColor) },
      ];
      tooltipTextFrame.appendChild(text);

      const tooltipFrame = figma.createFrame();
      tooltipFrame.name = "Tooltip_" + currentSelection.name;

       if (!currentSelection.absoluteBoundingBox) return;

      switch (formData.tooltipDirection) {
        case "up":
          tooltipFrame.layoutMode = "VERTICAL";
          tooltipFrame.itemSpacing = -5;
          nib.rotation = 180;
          tooltipFrame.appendChild(tooltipTextFrame);
          tooltipFrame.appendChild(nib);

          // tooltipFrame.x = currentSelection.x + currentSelection.width/2;
          // tooltipFrame.y = currentSelection.y - currentSelection.height/2 - 5;

          tooltipFrame.x = currentSelection.absoluteBoundingBox.x + currentSelection.width/2;
          tooltipFrame.y = currentSelection.absoluteBoundingBox.y - currentSelection.height/2 - 5;

          break;

        case "down":
          tooltipFrame.layoutMode = "VERTICAL";
          tooltipFrame.itemSpacing = -5;
          tooltipFrame.appendChild(nib);
          tooltipFrame.appendChild(tooltipTextFrame);

          tooltipFrame.x = currentSelection.absoluteBoundingBox.x + currentSelection.width/2;
          tooltipFrame.y = currentSelection.absoluteBoundingBox.y + currentSelection.height + 15;

          break;

        case "left":
          tooltipFrame.layoutMode = "HORIZONTAL";
          tooltipFrame.itemSpacing = -7;
          tooltipFrame.appendChild(tooltipTextFrame);
          tooltipFrame.appendChild(nib);

          tooltipFrame.x = currentSelection.absoluteBoundingBox.x - currentSelection.width/4;
          tooltipFrame.y = currentSelection.absoluteBoundingBox.y + currentSelection.height/2;

          break;

        case "right":
          tooltipFrame.layoutMode = "HORIZONTAL";
          tooltipFrame.itemSpacing = -7;
          tooltipFrame.appendChild(nib);
          tooltipFrame.appendChild(tooltipTextFrame);

          tooltipFrame.x = currentSelection.absoluteBoundingBox.x + currentSelection.width + 10;
          tooltipFrame.y = currentSelection.absoluteBoundingBox.y + currentSelection.height/2 - 5;

          break;
      }
      tooltipFrame.fills = [
        { type: "SOLID", color: { r: 1, g: 1, b: 1 }, visible: false },
      ];
      tooltipFrame.primaryAxisSizingMode = "AUTO";
      tooltipFrame.primaryAxisAlignItems = "CENTER";
      tooltipFrame.counterAxisSizingMode = "AUTO";
      tooltipFrame.counterAxisAlignItems = "CENTER";

      figma.currentPage.appendChild(tooltipFrame);
      // tooltipFrame.overlayPositionType = "MANUAL";
      // tooltipFrame.overlayBackground = {type: "NONE"}
      // Create Tooltip frame - End

      // addTooltip(`${currentSelection.id}`);
      figma.closePlugin();
    })
    .catch((error) => console.error(error));
};

// function addTooltip(id: string) {
//   figma.currentPage.selection[0].reactions = [
//     {
//       action: {
//         type: "NODE",
//         destinationId: id,
//         // overlayRelativePosition: {
//         //   x: -22,
//         //   y: 105,
//         // },s
//         // overlayPosition:"MANUAL",
//         navigation: "SCROLL_TO",
//         transition: {
//           type: "DISSOLVE",
//           easing: {
//             type: "EASE_IN_AND_OUT",
//           },
//           duration: 0.2,
//         },
//       },
//       actions: [
//         {
//           type: "NODE",
//           destinationId: id,
//           // overlayRelativePosition: {
//           //   x: -22,
//           //   y: 105,
//           // },
//           // overlayPosition:"MANUAL",
//           navigation: "SCROLL_TO",
//           transition: {
//             type: "DISSOLVE",
//             easing: {
//               type: "EASE_IN_AND_OUT",
//             },
//             duration: 0.2,
//           },
//         },
//       ],
//       trigger: { type: "ON_HOVER" },
//     },
//   ];
// }

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the '#' symbol if it's present
  hex = hex.replace(/^#/, "");

  // Parse the hex value into separate R, G, and B components
  const bigint = parseInt(hex, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  // Return the RGB values as an object
  return { r, g, b };
}
