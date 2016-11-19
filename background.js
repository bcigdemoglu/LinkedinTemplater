var showOptions = function(){
    chrome.runtime.openOptionsPage();
};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "showOptions") showOptions();
    }
);

chrome.browserAction.onClicked.addListener(function (object) {
    showOptions();
});

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        showOptions();
    }else if(details.reason == "update"){
        // In case necessary
    }
});