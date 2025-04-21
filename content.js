// Function to find and delete the first SVG element
function deleteFirstSvgElement() {
  // Find the first SVG element in the document
  const svgElement = document.querySelector("svg");

  // Check if an SVG element was found
  if (svgElement) {
    // Remove the SVG from the DOM
    svgElement.remove();
    console.log("First SVG element has been deleted");
  } else {
    console.log("No SVG element found in the document");
  }

  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
  ) {
    console.log("Message received from popup:", message);
    chrome.runtime.sendMessage({ greeting: "Hello from the content!" });
  });
}

// Execute the function when the content script runs
deleteFirstSvgElement();

// Optional: You might want to run this when DOM is fully loaded
document.addEventListener("DOMContentLoaded", deleteFirstSvgElement);

// Optional: If SVGs are added dynamically after page load,
// you might want to use a MutationObserver to catch new SVGs
