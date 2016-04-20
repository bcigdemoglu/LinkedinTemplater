var showOptions = function(){
    chrome.runtime.openOptionsPage();
};

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "showOptions") showOptions();
    }
);

chrome.runtime.onInstalled.addListener(function (object) {
    showOptions();
});