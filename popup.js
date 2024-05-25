console.log("from popup");
let startBtn = document.getElementById("start");
cancelBtn = document.getElementById("cancel");
loaderContainer = document.getElementById("loader-container");
const unitNumber = document.getElementById("unitNumber");
const bookByNumber = document.getElementById("bookByNumber");

const stopReservationKey = "stopReservation";
let stopReservation = localStorage.getItem(stopReservationKey) === "true";
if (stopReservation) {
  console.log("Popup : Reservation stopped running ");
  hideLoader();
} else {
  console.log("Popup : Reservation still running ");
  displayLoader();
}
let getByRequestNumber = false;
startBtn.addEventListener("click", () => {
  displayLoader();
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: getByRequestNumber ? "bookByNumber" : "invokeBookFunction",
        message: getByRequestNumber ? unitNumber.value : null,
      },
      function (response) {
        console.log(response);
      }
    );
  });
});
cancelBtn.addEventListener("click", () => {
  hideLoader();
  chrome.tabs.query({ active: !0, currentWindow: !0 }, function (e) {
    chrome.tabs.sendMessage(e[0].id, { action: "cancel" }, function (e) {
      console.log(e);
    });
  });
});
function displayLoader() {
  (loaderContainer.style.display = "flex"),
    (startBtn.style.display = "none"),
    (cancelBtn.style.display = "inline-block"),
    chrome.storage.local.set({ started: !0 });
}
function hideLoader() {
  (loaderContainer.style.display = "none"),
    (startBtn.style.display = "inline-block"),
    (cancelBtn.style.display = "none"),
    chrome.storage.local.set({ started: !1 });
}

bookByNumber.addEventListener("change", function (e) {
  if (e.target.checked) {
    unitNumber.style.display = "block";

    getByRequestNumber = true;
  } else {
    unitNumber.style.display = "none";
  }
});
