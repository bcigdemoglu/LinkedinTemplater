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

//declare message holder
let defaultMessage;

//declare buttons
let sel,
    defT,
    incr,
    decr,
    options;

//declare first and last name
let firstName,
    lastName;

//declare numTemplates
let numTemplates;

function update() {
    if(getSelect() === 0) {
        //Default message
        $("#custom-message").val(defaultMessage);
        $("#custom-message").sendkeys(" ");
        return true;
    }
    else {
        //Access template array in storage
        const index = getSelect() - 1;
        chrome.storage.sync.get("temps", function(res) {
            const temps = res.temps || [];
            if (temps[index]) {
                $("#custom-message").val(temps[index].substr(0,299));
                $("#custom-message").sendkeys(" ");
            }
            helpers.correctNames(firstName, lastName);
        });
    }
    setDefaultTemplate(getSelect());
    helpers.logAction("Selected template " + getSelect());
}

function updateNumTemplates() {
    chrome.storage.sync.get("temps", function(res) {
        numTemplates = res.temps ? res.temps.length : 0;
    });
}

function getDefaultTemplate() {
    chrome.storage.sync.get("default_template", function(res) {
        if (res.default_template) {
            select(parseInt(res.default_template));
        }
    });
}

function setDefaultTemplate(num) {
    chrome.storage.sync.set({
        default_template: num
    });
    $(`#${defT.id}`).val(num);
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
    const nameRegexp = /(\S+(?:\s?\S*?)*?)\s(\S*) +\| LinkedIn$/g;
    const names = nameRegexp.exec(namesSelector);
    firstName = toTitleCase(names[1]);
    lastName = toTitleCase(names[2]);
}

function runV2() {
    updateNumTemplates();
    const body = document.getElementById("custom-message");
    body.rows = 10;
    body.style.height = "inherit";

    // Set default message
    defaultMessage = body.value;
    
    sel = document.createElement("select");
    constructSelector(sel);
    
    defT = document.createElement("input");
    incr = document.createElement("div");
    decr = document.createElement("div");
    options = document.createElement("div");
    
    defT.setAttribute("id", "templater-deft");
    defT.setAttribute("size", "2");
    defT.setAttribute("maxlength", "2");
    
    incr.setAttribute("id", "templater-incr");
    incr.innerHTML = "&#x276f&#x276f&#x276f";
    
    decr.setAttribute("id", "templater-decr");
    decr.innerHTML = "&#x276e&#x276e&#x276e";
    
    options.setAttribute("id", "templater-opts");
    options.innerHTML = "OPTS";
    
    getDefaultTemplate();
    defT.addEventListener("change", function(){
        select(parseInt(this.value));
    });
    incr.addEventListener("click", function() {
        select("inc");
    });
    decr.addEventListener("click", function() {
        select("dec");
    });
    options.addEventListener("click", function() {
        chrome.extension.sendRequest({ msg: "showOptions" });
    });
    
    const bttns = [options, defT, decr, incr];
    const wrap = document.getElementsByClassName("send-invite__actions").item(0);
    const firstButton = wrap.firstChild;
    bttns.forEach(function (el) {
        if (el !== defT) {
            el.onmousedown = () => false;
        }
        helpers.beautify(el);
        wrap.insertBefore(el, firstButton);
    });

    // If "CLOSE" is clicked
    $(".send-invite__actions button.button-secondary-large-muted").on( "click", function() {
        bttns.forEach((el) => $(`#${el.id}`).remove());
        $(`#${sel.id}`).remove();
        helpers.logAction("Cancelled invite with template " + getSelect());
    });

    // If "SEND INVITATION" is clicked
    $(".send-invite__actions button.button-primary-large").on( "click", function() {
        helpers.logAction("Invited with template " + getSelect());
    });

    updateNames();
}

$(document).arrive("#custom-message", function() {
    runV2();
});

