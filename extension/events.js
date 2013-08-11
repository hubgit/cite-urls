/* when the toolbar button is clicked, open a page for interaction */
chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.create({ "url": chrome.extension.getURL("app.html") }, onTabCreated);
});

var onTabCreated = function(tab) {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    	var xhr = new XMLHttpRequest();
    	xhr.open("GET", request.url, true);
    	xhr.onload = function() {
    	  	sendResponse({ doi: detectDOI(this.responseXML) });
    	};
      xhr.onerror = function() {
        sendResponse();
      }
    	xhr.responseType = "document";
    	xhr.send();

    	return true;
	});
};

var detectDOI = function(doc) {
  var nodes, node, childNode, matches, i, j;

  // look for meta[name=citation_doi][content]
  node = doc.querySelector("meta[name=citation_doi]");

  if (node) {
      return node.getAttribute("content").replace(/^doi:/, "").trim();
  }

  // match DOI: test on http://t.co/eIJciunBRJ
  var doi_re = /10\.\d{4,}(?:\.\d+)*\/\S+/;

  // look in all text nodes for a DOI
  nodes = doc.getElementsByTagName("*");
  for (i = 0; i < nodes.length; i++) {
    node = nodes[i];

    if (!node.hasChildNodes()) {
      continue;
    }

    if (node.nodeName == "SCRIPT") {
      continue;
    }

    for (j = 0; j < node.childNodes.length; j++) {
      childNode = node.childNodes[j];

      // only text nodes
      if (childNode.nodeType !== 3) {
        continue;
      }

      if (matches = doi_re.exec(childNode.nodeValue)) {
        return matches[0].trim();
      }
    }
  }

  return null;
};