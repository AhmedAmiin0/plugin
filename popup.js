console.log("from popup");
let startBtn = document.getElementById("start");
cancelBtn = document.getElementById("cancel");
loaderContainer = document.getElementById("loader-container");
startBtn.addEventListener("click", () => {
  displayLoader()
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "invokeBookFunction" },
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
