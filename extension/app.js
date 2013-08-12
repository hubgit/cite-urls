var output = document.getElementById("output");

var fetch = function(url) {
	var row = document.createElement("li");
	row.innerHTML = "Fetching&hellip;";
	output.appendChild(row);

	chrome.runtime.sendMessage({ url: url.trim() }, function(response) {
		if (response.doi) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "http://data.crossref.org/" + encodeURIComponent(response.doi), true);
			xhr.setRequestHeader("Accept", "text/bibliography; style=apa; locale=en-GB");
			xhr.onload = function() {
				row.textContent = "";

				var node = document.createTextNode(this.responseText);
				row.appendChild(node);

			 	var doiIndex = this.responseText.indexOf("doi:");

			 	if (doiIndex) {
			 		var doiNode = node.splitText(doiIndex);
			 		var link = document.createElement("a");
			 		link.setAttribute("href", url);
			 		link.appendChild(doiNode);
			 		row.appendChild(link);
			 	}
			}
			xhr.onerror = function() {
				row.setAttribute("class", "error");
				row.textContent = "Error fetching citation from CrossRef for DOI " + doi;
			}
			xhr.send();
		} else {
			row.setAttribute("class", "error");
			row.textContent = "No DOI found in " + url;
		}
	});
};

document.getElementById("input").addEventListener("submit", function(event) {
	event.preventDefault();
	output.innerHTML = "";
	event.target.querySelector("textarea").value.split("\n").map(fetch);
}, true);

