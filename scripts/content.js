const stopReservationKey = "stopReservation";
let stopReservation = localStorage.getItem(stopReservationKey) === "true";
console.log("stopReservation", stopReservation);
async function book() {
  localStorage.setItem(stopReservationKey, "true");
  try {
    let url = window.location.href;
    let projectId = url.split("/")[5];

    const response = await fetch(
      `https://sakani.sa/marketplaceApi/search/v1/projects/${projectId}/available-units`,
      {
        withCredentials: true,
      }
    ).then((res) => res.json());

    if (response.data.length === 0) {
      chrome.runtime.sendMessage({ action: "noLandsAvailable" });
      return;
    }
    chrome.runtime.sendMessage({ action: "StartRerveNotification" });
    let units = response.data;
    let chunkedUnits = [];
    let i,
      j,
      temparray,
      chunk = 10;
    for (i = 0, j = units.length; i < j; i += chunk) {
      temparray = units.slice(i, i + chunk);
      chunkedUnits.push(temparray);
    }

    let canBook = [];
    for (let chunk of chunkedUnits) {
      let i = 0;
      if (canBook.some((e) => e === true)) break;
      for (let unit of chunk) {
        if (canBook.some((e) => e === true)) break;
        canBook[i] = await validateUserCanBook(projectId);

        if (canBook[i] === true) {
          await fetch(
            `https://sakani.sa/mainIntermediaryApi/v4/units/reserve`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: {
                  attributes: {
                    unit_code: unit.attributes.unit_code,
                  },
                },
              }),
              withCredentials: true,
            }
          )
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
            });
        }

        i++;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    chrome.runtime.sendMessage({ action: "bookingCompleted" });
  } catch (e) {
    console.log(e);
    chrome.runtime.sendMessage({ action: "SomethingWentWrong" });
  } finally {
    localStorage.setItem(stopReservationKey, "false");
    chrome.runtime.sendMessage({ action: "stop-loader" });
  }
}

async function validateUserCanBook(id) {
  let canBook = false;
  try {
    const firstRequest =
      "https://sakani.sa/mainIntermediaryApi/v4/bookings/precondition_check";
    const response = await fetch(firstRequest, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            national_id_number: "F45D425E378FF8B237248FE032F6DAA9",
            project_id: id,
          },
          id: "beneficiary_sessions",
        },
      }),
      withCredentials: true,
    }).then((res) => res.json());
    // .catch((e) => {
    // });
    if (response.status === 401) {
      chrome.runtime.sendMessage({ action: "PleaseLoginNotification" });
      throw new Error("Please Login");
    }
    const secondReq = await fetch(
      `https://sakani.sa/sakani-queries-service/cqrs-res?topic=booking_precondition_check_completed&request_id=${response.data.request_id}`,
      {
        withCredentials: true,
      }
    ).then((res) => res.json());
    if (secondReq.status === 401) {
      chrome.runtime.sendMessage({ action: "PleaseLoginNotification" });
      throw new Error("Please Login");
    }
    if (secondReq.data?.block_booking_reason?.length === 0) {
      canBook = true;
    }
  } catch (e) {
    return canBook;
  }
}
async function bookWithRequestNumber(requestNumber = 10) {
  localStorage.setItem(stopReservationKey, "true");
  try {
    let url = window.location.href;
    let projectId = url.split("/")[5];

    const response = await fetch(
      `https://sakani.sa/marketplaceApi/search/v1/projects/${projectId}/available-units`,
      {
        withCredentials: true,
      }
    ).then((res) => res.json());

    if (response.data.length === 0) {
      chrome.runtime.sendMessage({ action: "noLandsAvailable" });
      return;
    }
    chrome.runtime.sendMessage({ action: "StartRerveNotification" });
    let units = response.data;

    if (units.length >= requestNumber) {
      // get the first requestNumber units
      units = units.slice(0, requestNumber);
      await Promise.all(
        units.map(async (unit) => {
          await fetch(
            `https://sakani.sa/mainIntermediaryApi/v4/units/reserve`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: {
                  attributes: {
                    unit_code: unit.attributes.unit_code,
                  },
                },
              }),
              withCredentials: true,
            }
          )
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
            });
        })
      );
    }
    chrome.runtime.sendMessage({ action: "bookingCompleted" });
  } catch (e) {
    console.log(e);
    chrome.runtime.sendMessage({ action: "SomethingWentWrong" });
  } finally {
    chrome.runtime.sendMessage({ action: "stop-loader" });
    localStorage.setItem(stopReservationKey, "false");
    chrome.runtime.sendMessage({ action: "ReservationRequestHasBeenSent" });
  }
}

// In content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "invokeBookFunction") {
    book();
    sendResponse({ message: "Book function invoked" });
  }
  if (message.action === "bookByNumber") {
    bookWithRequestNumber(message.message);
    sendResponse({ message: "Book function invoked" });
  }
  if (message.action === "cancel") {
    localStorage.setItem(stopReservationKey, "false");
  }
});
