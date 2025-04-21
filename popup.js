document.addEventListener("DOMContentLoaded", function () {
  //   alert("Hello from the popup!");
  chrome.runtime.onMessage.addListener(function (
    message,
    sender,
    sendResponse
  ) {
    console.log("Message received from content:", message);
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTabId = tabs[0].id;

    // Step 2: Now you can send a message to that specific tab
    chrome.tabs.sendMessage(activeTabId, { greeting: "Hello from the popup!" });
  });
});
