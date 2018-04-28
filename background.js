/* global chrome firebase getUid timeStamp */
/* eslint-disable no-unused-vars */

let actionNum = 1;

// Initialize Firebase
const dbConfig = {
  apiKey: "AIzaSyBYp8MTp3AzU5itbJTTq-MR-9BYNbPZ6ic",
  databaseURL: "https://linkedintemplater.firebaseio.com",
  projectId: "linkedintemplater",
};
firebase.initializeApp(dbConfig);

// Send anonymous logging to improve user experience
function logActionDB(action) { // eslint-disable-line no-unused-vars
  return getUid().then(({ uid, newUser }) => {
    const logData = {
      uid,
      time: Date.now(),
      date: timeStamp(),
      action,
      actionNum,
    };
    const key = `${logData.uid}/${logData.time} - ${logData.action}`;

    if (newUser) {
      logActionDB("Generated new UID");
    }
    firebase.database().ref(`logs/${key}`).set(logData);
    // Increase action number for the current session
    // which begins when the extension is enabled
    actionNum++;
  });
}

const showOptions = () => {
  chrome.runtime.openOptionsPage();
};

chrome.extension.onRequest.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === "showOptions") {
      // see content.js -> runV2()
      showOptions();
    } else if (request.msg === "logAct") {
      // see js/content.js -> logAction()
      logActionDB(request.action);
    }
  }
);

chrome.browserAction.onClicked.addListener(function (object) {
  showOptions();
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    logActionDB("Installed extension");
    showOptions();
  } else if (details.reason == "update") {
    logActionDB("Updated extension");
  }
});