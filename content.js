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
	options;

//declare button array
var bttns;
window.onload = run();

function restore() {
	body.value = backupMessage;
}

function selectFriendIfNonPicked() {
	radioBttns = document.querySelectorAll("#main-options > li > .radio-btn");
	for (var i = 0; i < radioBttns.length; i++) {
		if (radioBttns[i].checked) return;
	}
	// Select friend if nothing is picked
	document.getElementById('IF-reason-iweReconnect').click();
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
							.replace(/\[fn]/ig, getVal("firstName"))
							.replace(/\[ln]/ig, getVal("lastName")));

}

String.prototype.Capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

function getVal(str) {
    var v = window.location.search.match(new RegExp('(?:[\?\&]'+str+'=)([^&]+)'));
    if(v) v[1] = v[1].replace('+',' ').Capitalize();
    return v ? v[1] : null;
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
	el.className = "btn-primary";
	el.setAttribute("font-size","60%");
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
	wrap = document.getElementsByClassName("wrap").item(0),
	body = document.getElementById("greeting-iweReconnect");
	defaultMessage = body.value;
	backupMessage = defaultMessage;


	el = document.createElement("div");
	sel = constructSelections();
	incr = document.createElement("label");
	decr = document.createElement("label");
	res = document.createElement("label");
	options = document.createElement("label");
	sep = document.createElement("label");

	sel.selectedIndex == 0;
	incr.innerHTML = " &#x276f&#x276f&#x276f ";
	decr.innerHTML = " &#x276e&#x276e&#x276e ";
	options.innerHTML = " OPTIONS ";
	sep.innerHTML = "|";
	sep.style.color = "white";

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

	for (var i = 0; i < bttns.length; i++) {
		el.appendChild(bttns[i]);
		if (i > 0 && i < bttns.length - 1) {
			el.appendChild(sep.cloneNode(true));
		}
	}

	wrap.appendChild(el);

	selectFriendIfNonPicked();
}