// Saves options to chrome.storage

function save_options(evt) {
    var temps = document.getElementsByClassName("temp");
    var tempsRA = pushTemplateValues(temps);
    chrome.storage.sync.set({
        "temps" : tempsRA
    }, function() {
        // Update status to let user know options were saved.
        var butnum = evt.target.number;
        var status = document.getElementsByClassName('status')[butnum];
        console.log(butnum);
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get(
        "temps"
    , function(items) {
        var tempsRA = [];
        if (items["temps"]) tempsRA = items["temps"];
        for (var i = 1; i <= tempsRA.length; i++) {
            document.getElementById('temp'+i)
                .value = tempsRA[i-1];
        }
        document.getElementsByClassName('save')[0].click();
    });
}

function pushTemplateValues(temps) {
    var list = [];
    for(var i = 0; i < temps.length; i++) {
        list.push(temps.item(i).value);
    }
    return list;
}

function updateTempNum() {
    var temps = document.getElementsByClassName("temp");
    chrome.storage.sync.set({"tempnum" : temps.length});
}

function createPage() {
    var contain = document.getElementById("templater");
    // Copy save button
    var savebtn = document.getElementById("save").cloneNode(true);
    savebtn.removeAttribute("id");
    document.getElementById("save").remove();
    // Copy status message
    var status = document.getElementById("status").cloneNode(true);
    // status.removeAttribute("id");
    // document.getElementById("status").remove();
    for(var i = 1; i <= numTemplates; i++) {
        var ppri = document.createElement("div");
        ppri.setAttribute("class", "panel panel-primary");
        var phead = document.createElement("div");
        phead.setAttribute("class", "panel-heading");
        var h3 = document.createElement("h3");
        h3.setAttribute("class","panel-title");
        h3.innerHTML = "Template " + i;
        phead.appendChild(h3);
        ppri.appendChild(phead);
        var pbody = document.createElement("div");
        pbody.setAttribute("class","panel-body");
        var tempText = document.createElement("textarea");
        tempText.setAttribute("class", "form-control temp");
        tempText.setAttribute("id", "temp"+i);
        tempText.setAttribute("maxlength", "300");
        tempText.setAttribute("rows", "7");
        tempText.setAttribute("cols", "100");
        tempText.setAttribute("style", "width: 600px !important;")
        tempText.innerHTML = "This is Template "+i+".\n"+
                "Use ARROWS to move across templates.\n"+
                "Click OPTIONS to edit templates.\n"+
                "Click SAVE to save templates.\n"+
                "\n[fn] becomes First Name\n"+
                "[ln] becomes Last Name\n"+
                "\nExample Template:\n"+
                "Hello [fn],\nI'd like to add you to my professional network on LinkedIn.";
        pbody.appendChild(tempText);
        pbody.appendChild(savebtn.cloneNode(true));
        pbody.appendChild(status.cloneNode(true));
        ppri.appendChild(pbody);
        contain.appendChild(ppri);
    }

    var saveRA = document.getElementsByClassName('save');
    for (var butnum = 0; butnum < saveRA.length; butnum++) {
        saveRA[butnum].addEventListener('click', save_options, false);
        saveRA[butnum].number = butnum;
    }

}

var numTemplates = 7;
createPage();
document.addEventListener('DOMContentLoaded', restore_options);
