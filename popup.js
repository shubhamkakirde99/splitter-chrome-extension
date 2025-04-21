// initialize global variables
let $personItemTemplate;
let $peopleList;
let $addPersonButton;

function refreshNameList(savedPeople) {
    $peopleList.empty();
    if ($personItemTemplate.length === 0) {
        console.error(
            "Template not found in the DOM with ID 'person-item-template'."
        );
        return;
    }
    // Populate the list with saved people using the template
    savedPeople.forEach((person, i) => {
        // Clone the template content
        let $personItem = $($personItemTemplate.html());
        // const $personItemCopy = $personItem.clone();

        // Find elements in the template and update their content
        $personItem.find(".person-name").text(person);
        setIndices($personItem, i);

        // Append the filled template to the list
        $peopleList.append($personItem);
    });
    // this may not be the best idea. will see later
    $addPersonButton.removeClass("disabled");
}

function setIndices($personItem, index) {
    $personItem.find(".edit-btn").attr("data-person-index", index);
    $personItem.find(".save-btn").attr("data-person-index", index);
    $personItem.find(".delete-btn").attr("data-person-index", index);
    $personItem.find(".cancel-btn").attr("data-person-index", index);
    $personItem.find(".person-name-input").attr("data-person-index", index);
}

function initStorage() {
    // Initialize storage with default values if not already set
    chrome.storage.local.set({ editingIndex: null });
}

async function handleSaveButtonClick($button, event) {
    const personIndex = $button.data("person-index");
    // Get the input element with class "person-name-input" from this parent
    const $nameInput = $button.parent().parent().find(".person-name-input");
    // Get the value from the input
    const personName = $nameInput.val();
    // Make sure we found a valid input and it has some content
    if (!$nameInput.length || !personName.trim()) {
        console.error("Could not find input or input is empty");
        return;
    }
    let savedPeople = await addSavedPersonToStorage(personName, personIndex);
    refreshNameList(savedPeople);
}

async function addSavedPersonToStorage(personName, personIndex) {
    let savedPeople = await getSavedPeopleFromStorage();
    if (personIndex < savedPeople.length) {
        savedPeople[personIndex] = personName;
    } else if (personIndex === savedPeople.length) {
        savedPeople.push(personName);
    } else {
        console.error(
            `Invalid person index: ${personIndex} for name: ${personName}`
        );
        return;
    }
    console.log("Saved people:", savedPeople);
    await chrome.storage.local.set({ savedPeople });
    return savedPeople;
}

async function handleDeleteButtonClick($button) {
    const personIndex = $button.data("person-index");
    console.log("Delete button clicked for person index:", personIndex);
    let savedPeople = await getSavedPeopleFromStorage();
    if (personIndex < savedPeople.length) {
        await removePErsonFromStorage(personIndex);
        refreshNameList(savedPeople);
    } else {
        console.error(`Invalid person index: ${personIndex} for deletion`);
    }
    refreshNameList(await getSavedPeopleFromStorage());
}

async function removePErsonFromStorage(personIndex) {
    let savedPeople = await getSavedPeopleFromStorage();
    savedPeople.splice(personIndex, 1);
    await chrome.storage.local.set({ savedPeople });
}

async function getSavedPeopleFromStorage() {
    return (await chrome.storage.local.get(["savedPeople"]))?.savedPeople || [];
}

document.addEventListener("DOMContentLoaded", async function () {
    // init global variables
    $personItemTemplate = $("#person-item-template");
    $peopleList = $("#people-list");
    $addPersonButton = $("#add-person-btn");

    // add messaging listeners
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
        chrome.tabs.sendMessage(activeTabId, {
            greeting: "Hello from the popup!",
        });
    });

    // main logic

    let savedPeople = await getSavedPeopleFromStorage();

    if ($peopleList.length) {
        refreshNameList(savedPeople);
    } else {
        console.error("Could not find element with ID 'people-list'");
    }

    $addPersonButton.on("click", async function () {
        let $personItem = $($personItemTemplate.html());
        // const $personItemCopy = $personItem.clone();

        $personItem.find(".person-name").addClass("d-none");
        $personItem.find(".person-name-input").removeClass("d-none");

        $personItem.find(".edit-btn").addClass("d-none");
        $personItem.find(".save-btn").removeClass("d-none");

        $personItem.find(".delete-btn").addClass("d-none");
        console.log($personItem.find(".delete-btn"));
        $personItem.find(".cancel-btn").removeClass("d-none");

        // set person index
        savedPeopleLength = (await getSavedPeopleFromStorage())?.length || 0;
        setIndices($personItem, savedPeopleLength);

        // Append the filled template to the list
        $peopleList.append($personItem);
        $addPersonButton.addClass("disabled");
    });

    $peopleList.on("click", ".save-btn", function () {
        const $button = $(this);

        handleSaveButtonClick($button);
        $addPersonButton.removeClass("disabled");
    });

    // Example of how to remove a person from the list
    $peopleList.on("click", ".delete-btn", function () {
        const $button = $(this);
        handleDeleteButtonClick($button);
        $addPersonButton.removeClass("disabled");
    });

    $peopleList.on("click", ".cancel-btn", async function () {
        refreshNameList(await getSavedPeopleFromStorage());
        $addPersonButton.removeClass("disabled");
    });
});
