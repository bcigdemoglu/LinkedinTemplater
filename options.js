var numTemplates = 10;

// Saves options to chrome.storage
function save_options(evt) {
    console.log(chrome.storage.sync);
    var tempsRA = pushTemplateValues();
    chrome.storage.sync.set({
        "temps" : tempsRA
    }, function() {
        // Update status to let user know options were saved.
        var butnum = evt.target.number;
        var button = document.getElementsByClassName('save')[butnum];
        button.setAttribute("class","btn btn-md btn-success save");
        var status = document.getElementsByClassName('status')[butnum];
        console.log(butnum);
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
            button.setAttribute("class","btn btn-md btn-primary save");
        }, 1000);
    });
}

function import_templates(fileInput) {
    var file = fileInput.files[0];
    var textType = /text.*/;
    if (file.type.match(textType)) {
        var reader = new FileReader();
        console.log("okuyo");
        reader.onload = function(e) {
            var lines = this.result.split('\n');
            var list = [];
            list.push("");
            var templateCount = 1;
            for(var line = 0; line < lines.length; line++){
                console.log(list);
                var currLine = lines[line];
                if(currLine != "---donotremovethis---") {
                    list[templateCount - 1] += currLine + "\n";
                } else if (templateCount <= numTemplates) {
                    list[templateCount - 1] = list[templateCount - 1].trim();
                    list.push("");
                    templateCount++;
                } else {
                    break;
                }
            }
            console.log(list);
            chrome.storage.sync.set({
                "temps" : list
            }, function() {
                location.reload();
            });
        }
        reader.readAsText(file);
    }
}

function export_templates() {
    var content = pushTemplateValues().join("\n---donotremovethis---\n");
    content += "\n---donotremovethis---\n";
    download('linkedin_templater_backup.txt', content);
    return null;
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
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
    document.getElementById('export').addEventListener('click', export_templates, false);

    var fileInput = document.getElementById('import');
    fileInput.addEventListener('change', function(e) {
        import_templates(this);
    });
}

function pushTemplateValues() {
    var temps = document.getElementsByClassName("temp");
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
    // Copy separator
    var separator = document.getElementById("sep").cloneNode(true);
    separator.removeAttribute("id");
    // Copy status message
    var status = document.getElementById("status").cloneNode(true);
    // status.removeAttribute("id");
    // document.getElementById("status").remove();
    for(var i = 1; i <= numTemplates; i++) {
        var ppri = document.createElement("div");
        ppri.setAttribute("class", "panel panel-primary");
        var phead = document.createElement("div");
        phead.setAttribute("class", "panel-heading");
        var h5 = document.createElement("h5");
        h5.setAttribute("class","panel-title");
        h5.innerHTML = "Template " + i;
        phead.appendChild(h5);
        ppri.appendChild(phead);
        var pbody = document.createElement("div");
        pbody.setAttribute("class","panel-body");
        var tempText = document.createElement("textarea");
        tempText.setAttribute("class", "form-control temp");
        tempText.setAttribute("id", "temp"+i);
        tempText.setAttribute("maxlength", "300");
        tempText.setAttribute("rows", "9");
        tempText.setAttribute("cols", "100");
        tempText.setAttribute("style", "width: 600px !important;")
        tempText.innerHTML = "This is Template "+i+".\n"+
                "Use ARROWS to move across templates.\n"+
                "Click OPTIONS to edit templates.\n"+
                "Click SAVE to save templates.\n"+
                "[fn] becomes First Name\n"+
                "[ln] becomes Last Name\n"+
                "Example Template:\n"+
                "Hello [fn],\nI'd like to add you to my professional network on LinkedIn.";
        pbody.appendChild(tempText);
        pbody.appendChild(savebtn.cloneNode(true));
        pbody.appendChild(status.cloneNode(true));
        pbody.appendChild(separator.cloneNode(true));
        ppri.appendChild(pbody);
        contain.appendChild(ppri);
    }

    var saveRA = document.getElementsByClassName('save');
    for (var butnum = 0; butnum < saveRA.length; butnum++) {
        saveRA[butnum].addEventListener('click', save_options, false);
        saveRA[butnum].number = butnum;
    }

}

createPage();
document.addEventListener('DOMContentLoaded', restore_options);
