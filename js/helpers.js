/* global $ chrome */
/* eslint-disable no-unused-vars */

function beautify(el) {
    el.className = "button-secondary-small";
    el.style.lineHeight = $(".button-secondary-large").css( "line-height" );
    el.style.height = $(".button-secondary-large").css( "height" );
}

function correctNames(firstName, lastName) {
    const msg = $("#custom-message").val();
    $("#custom-message").val(
        decodeURI(msg
            .replace(/\[fn]/ig, firstName)
            .replace(/\[ln]/ig, lastName)
        )
    );
}

function constructSelector(selector) {
    selector.setAttribute("id","templater-sel");

    const defOpt = document.createElement("option");
    defOpt.setAttribute("value","0");
    defOpt.setAttribute("name","default");
    defOpt.innerHTML = "default";
    selector.appendChild(defOpt);

    chrome.storage.sync.get("temps", function(res) {
        const temps = res.temps || [];
        temps.forEach((val, i) => {
            const opt = document.createElement("option");
            //Since 0 is allocated for default
            opt.setAttribute("value", i);
            //Assign name here
            opt.innerHTML = "Template "+i;
            selector.appendChild(opt);
        });
    });
}

function logAction(action) {
    chrome.extension.sendRequest({ 
        msg: "logAct",
        action,
    });
}
