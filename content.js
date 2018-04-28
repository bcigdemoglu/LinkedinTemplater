/* global $ chrome */
/*eslint no-undef: "error"*/
/*eslint-env browser*/

/* eslint-disable no-undef */
const helpers = {
  beautify,
  correctNames,
  constructSelector,
  logAction,
};
/* eslint-enable no-alert */

const buttonIDs = {
  defT: "templater-deft",
  opts: "templater-opts",
  incr: "templater-incr",
  decr: "templater-decr",
};

const button = {
  defT: () => $(`#${buttonIDs.defT}`),
  opts: () => $(`#${buttonIDs.opts}`),
  incr: () => $(`#${buttonIDs.incr}`),
  decr: () => $(`#${buttonIDs.decr}`),
};

//declare message holder
let defaultMessage;

//declare buttons
let sel;

//declare first and last name
let firstName,
  lastName;

//declare numTemplates
let numTemplates;

function update() {
  if (getSelect() === 0) {
    //Default message
    $("#custom-message").val(defaultMessage);
    $("#custom-message").sendkeys(" ");
    button.defT().val(getSelect());
    return true;
  }
  else {
    //Access template array in storage
    const index = getSelect() - 1;
    chrome.storage.sync.get("temps", function (res) {
      const temps = res.temps || [];
      if (temps[index]) {
        $("#custom-message").val(temps[index].substr(0, 299));
        $("#custom-message").sendkeys(" ");
      }
      helpers.correctNames(firstName, lastName);
    });
  }
  setDefaultTemplate(getSelect());
  helpers.logAction("Selected template " + getSelect());
}

function updateNumTemplates() {
  chrome.storage.sync.get("temps", function (res) {
    numTemplates = res.temps ? res.temps.length : 0;
  });
}

function getDefaultTemplate() {
  chrome.storage.sync.get("default_template", function (res) {
    if (res.default_template) {
      select(parseInt(res.default_template));
    }
  });
}

function setDefaultTemplate(num) {
  chrome.storage.sync.set({
    default_template: num
  });
  button.defT().val(num);
}

function select(change) {
  if (change === "inc" &&
    sel.selectedIndex + 1 <= numTemplates) {
    sel.selectedIndex++;
  } else if (change === "dec" &&
    sel.selectedIndex > 0) {
    sel.selectedIndex--;
  } else if ($.type(change) === "number" &&
    change >= 0) {
    sel.selectedIndex = (change <= numTemplates) ? change : numTemplates;
  } else if ($.type(change) === "number" &&
    change < 0) {
    sel.selectedIndex = 0;
  } else {
    return false;
  }
  update();
  return true;
}

function getSelect() {
  return sel.selectedIndex;
}

function updateNames() {
  function toTitleCase(str) {
    return str.replace(/\S+/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  const namesSelector = document.querySelector("head > title").innerHTML;
  const nameRegexp = /([a-zA-Z]+(?:\s?\S*?)*?)\s(\S*) +\| LinkedIn$/g;
  const names = nameRegexp.exec(namesSelector);
  firstName = toTitleCase(names[1]);
  lastName = toTitleCase(names[2]);
}

function constructButtons() {
  const wrap = document.getElementsByClassName("send-invite__actions").item(0);
  sel = document.createElement("select");
  constructSelector(sel);

  // Add line break
  const breaks = $("<br>", {
    id: "templater-break",
  });

  const opts = $("<div/>", {
    id: buttonIDs.opts,
    text: "Edit Templates",
    on: {
      mousedown: () => false,
      click: () => chrome.extension.sendRequest({ msg: "showOptions" }),
    },
  });

  const defT = $("<input/>", {
    id: buttonIDs.defT,
    maxlength: "2",
    on: {
      change: () => select(parseInt(button.defT().val())),
    },
    prop: {
      size: 2,
    },
  });

  const decr = $("<div/>", {
    id: buttonIDs.decr,
    text: "❮❮❮ Prev",
    on: {
      mousedown: () => false,
      click: () => select("dec"),
    },
  });

  const incr = $("<div/>", {
    id: buttonIDs.incr,
    text: "Next ❯❯❯",
    on: {
      mousedown: () => false,
      click: () => select("inc"),
    },
  });

  // Grab values from "MORE..." button
  const originalEl = $(".button-secondary-large-muted");
  const buttons = [breaks, opts, defT, decr, incr];
  buttons.forEach((el) => {
    helpers.beautify(el, originalEl);
    el.insertAfter(wrap.lastChild);
  });

  return buttons;
}

function runV2() {
  updateNumTemplates();
  const body = document.getElementById("custom-message");
  body.rows = 10;
  body.style.height = "inherit";

  // Set default message
  defaultMessage = body.value;

  const buttons = constructButtons();
  getDefaultTemplate();

  // If "CANCEL" is clicked
  const cancelButton = $(".send-invite__actions button.button-secondary-large-muted");
  cancelButton.on("click", () => {
    buttons.forEach( el => el.remove() );
    $(sel).remove();
    helpers.logAction("Cancelled invite with template " + getSelect());
  });

  // If "SEND INVITATION" is clicked
  $(".send-invite__actions button.button-primary-large").on("click", function () {
    helpers.logAction("Invited with template " + getSelect());
  });

  updateNames();
}

$(document).arrive("#custom-message", function () {
  runV2();
});

