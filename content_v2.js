//declare message holders
var wrap,
	body,
	defaultMessage,
	backupMessage;

//declare buttons
var el,
	lbl,
	sel,
	incr,
	decr,
	res,
	back,
	options,
	firstName,
	lastName;

//declare button array
var bttns;

$(document).arrive("#custom-message", function() {
    // 'this' refers to the newly created element
    run();
});

function restore() {
	body.value = backupMessage;
}

function update() {
	//get str based on selection value
	var str = value() - 1; //correction due to default
	backupMessage = body.value;
	//Default message
	if(str=="-1") {
		body.value = defaultMessage;
	}
	//Access template array in storage
	else {
		chrome.storage.sync.get("temps", function(res) {
			var list = [];
			if (res["temps"]) list = res["temps"];
			if (list.length > str) body.value = list[str];
			correctNames();
		});
	}
}

function correctNames() {
	body.value = decodeURI(body.value
							.replace(/\[fn]/ig, firstName)
							.replace(/\[ln]/ig, lastName));

}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function updateNames() {
		var namesSelector = document.querySelector("head > title").innerHTML;
		var nameRegexp = /(\S+(?:\s?\S*?)*?)\s(\S*) +\| LinkedIn$/g;
    var names = nameRegexp.exec(namesSelector);
    firstName = toTitleCase(names[1]);
    lastName = toTitleCase(names[2]);
}

function value(change) {
	if (change == "inc") {
		var max = sel.selectedIndex;
		sel.selectedIndex++;
		if(sel.selectedIndex == "-1")
			sel.selectedIndex = max;
	} else if (change == "dec") {
		sel.selectedIndex--;
	} else if (change == "res") {
		sel.selectedIndex = 0;
	} else if (change > 0) {
		sel.selectedIndex = change;
	}
	return sel.selectedIndex;
}

function buttonify(el) {
	el.className = "button-secondary-large ml3";
	el.onmousedown = function() { return false; };
	// el.setAttribute("margin-left","1px");
}

function constructSelections() {
	var sel = document.createElement("select");
	sel.setAttribute("id","sel");

	var defOpt = document.createElement("option");
	defOpt.setAttribute("value","0");
	defOpt.setAttribute("name","default");
	defOpt.innerHTML = "default";
	sel.appendChild(defOpt);

	chrome.storage.sync.get("temps", function(res) {
		var list = [];
		if (res["temps"]) list = res["temps"];
		for(var i = 1; i <= list.length; i++) {
			var opt = document.createElement("option");
			//Since 0 is allocated for default
			opt.setAttribute("value", i);
			//Assign name here
			opt.innerHTML = "Template "+i;
			sel.appendChild(opt);
		}
	});
	return sel;
}

function run() {
	wrap = document.getElementsByClassName("send-invite__actions").item(0),
	body = document.getElementById("custom-message");
	defaultMessage = body.value;
	backupMessage = defaultMessage;


	el = document.createElement("div");
	sel = constructSelections();
	incr = document.createElement("div");
	decr = document.createElement("div");
	res = document.createElement("label");
	options = document.createElement("div");

	sel.selectedIndex == 0;
	incr.innerHTML = " &#x276f&#x276f&#x276f ";
	decr.innerHTML = " &#x276e&#x276e&#x276e ";
	options.innerHTML = " OPTIONS ";

	bttns = [decr, incr, options];

	for (var i = 0; i < bttns.length; i++)
		buttonify(bttns[i]);

	incr.addEventListener("click", function() {
		value("inc");
		update();
	});
	decr.addEventListener("click", function() {
		if (value() > 0) value("dec");
		update();
	});
	options.addEventListener("click", function() {
		chrome.extension.sendRequest({ msg: "showOptions" });
	})
	options.className = "button-secondary-large ml3 mr3";

	var firstButton = wrap.firstChild;

	for (var i = 0; i < bttns.length; i++) {
		wrap.insertBefore(bttns[i], firstButton);
	}
	updateNames();

}