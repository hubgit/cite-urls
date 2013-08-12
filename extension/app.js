var outputList = document.getElementById("output");
var inputForm = document.getElementById("input");
var loading;

var output = function(url, doi, citation) {
	if (loading) {
		loading.parentNode.removeChild(loading);
		loading = null;
	}

	var text = citation + " ";

	if (doi) {
		text += "doi:" + doi + " ";
	}

	text += url;

	var row = document.createElement("li");
	row.textContent = text;

	outputList.appendChild(row);
};

var fetchCitation = function(url, doi) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://data.crossref.org/" + encodeURIComponent(doi), true);
	xhr.setRequestHeader("Accept", "text/bibliography; style=apa; locale=en-GB");
	xhr.onload = function() {
	  output(url, null, this.responseText); // responseText contains doi:{doi} already
	}
	xhr.onerror = function() {
	  output(url, doi, "Error fetching citation");
	}
	xhr.send();
};

var fetchDOI = function(url) {
	chrome.runtime.sendMessage({ url: url.trim() }, function(response) {
		if (response.doi) {
			fetchCitation(url, response.doi);
		} else {
			output("No DOI found for URL " + url);
		}
	});
};

inputForm.addEventListener("submit", function(event) {
	event.preventDefault();

	outputList.innerHTML = "";

	loading = document.createElement("li");
	loading.innerHTML = "Fetching&hellip;";
	outputList.appendChild(loading);

	inputForm.querySelector("textarea").value.split("\n").map(fetchDOI);
}, true);

