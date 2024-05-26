var stopLoader = !1;
chrome.runtime.onMessage.addListener((e, i, t) => {
  if ("WaitingNotification" === e.action) {
    let a = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "انتظر حتي يتم تحميل الصفحة بالكامل",
    };
    chrome.notifications.create("notificationWaitLoad", a), (stopLoader = !0);
  } else if ("StartRerveNotification" === e.action) {
    let o = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "جاري العمل علي حجز القطعة الرجاء اﻹنتظار",
    };
    chrome.notifications.create("notificationStartReserve", o);
  } else if ("noLandsAvailable" === e.action) {
    let n = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "هذا المشروع لا توجد به وحدات متاحة",
    };
    chrome.notifications.create("notificationNoLandsAvailable", n),
      (stopLoader = !0);
  } else if ("projectIsNotAvailableToTeserve" === e.action) {
    let s = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "هذا المشروع غير متاح للحجز حالياً",
    };
    chrome.notifications.create(
      "notificationProjectIsNotAvailableToTeserve",
      s
    ),
      (stopLoader = !0);
  } else if ("PleaseLoginNotification" === e.action) {
    let r = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "الرجاء تسجيل الدخول أولاً",
    };
    chrome.notifications.create("notificationStartReserve", r),
      (stopLoader = !0);
  } else if ("bookingCompleted" === e.action) {
    let r = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "تم حجز الوحدات بنجاح",
    };
    chrome.notifications.create("notificationStartReserve", r),
      (stopLoader = !0);
  } else if ("SomethingWentWrong" === e.action) {
    let r = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "حدث خطأ ما",
    };
    chrome.notifications.create("notificationStartReserve", r),
      (stopLoader = !0);
  } else if ("ReservationRequestHasBeenSent" === e.action) {
    let r = {
      type: "basic",
      iconUrl: "images/logo.png",
      title: "Sakani Land Project Reservation",
      message: "تم ارسال طلب الحجز بنجاح",
    };
    chrome.notifications.create("notificationStartReserve", r),
      (stopLoader = !0);
  }
}),
  chrome.runtime.onMessage.addListener(function (e, i, t) {
    "stop-loader" === e.action && t({ stopLoader: stopLoader });
  });
