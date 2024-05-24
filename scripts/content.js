async function book() {
  try {
    let url = window.location.href;
    let projectId = url.split("/")[5];
    console.log(projectId);
    const response = await fetch(
      `https://sakani.sa/marketplaceApi/search/v1/projects/${projectId}/available-units`,
      {
        withCredentials: true,
      }
    ).then((res) => res.json());
    // is status code is 401
    if (response.status === 401) {
      chrome.runtime.sendMessage({ action: "PleaseLoginNotification" });
      return;
    }

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

    let status = null;
    let canBook = null;
    for (let chunk of chunkedUnits) {
      let i = 0;
      if (status !== null) break;
      for (let unit of chunk) {
        if (status !== null) break;

        if (i === 0) {
          console.log(i, status);
          canBook = await validateUserCanBook(projectId);
        }
        console.log(canBook, status);

        if (canBook) {
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

          if (i === 9) {
            canBook = null;
          }
        }

        i++;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  } catch (e) {
    console.log(e);
  } finally {
    chrome.runtime.sendMessage({ action: "stop-loader" });
  }
}

async function validateUserCanBook(id) {
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

  const secondReq = await fetch(
    `https://sakani.sa/sakani-queries-service/cqrs-res?topic=booking_precondition_check_completed&request_id=${response.data.request_id}`,
    {
      withCredentials: true,
    }
  ).then((res) => res.json());
  if (secondReq.data?.block_booking_reason?.length === 0) {
    return true;
  }
  return false;
}

// In content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "invokeBookFunction") {
    book(); // Call the book function
    sendResponse({ message: "Book function invoked" });
  }
});
