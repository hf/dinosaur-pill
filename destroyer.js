(function destroyer(DinosaurPill) {
  DinosaurPill.on(DinosaurPill.Events.TAKEDOWN, function(lookingAt, website) {
    var url = "*://*." + website.get("domain") + "/*";

    chrome.tabs.update(lookingAt.tabID, { url: chrome.extension.getURL("/pill.html") });

    chrome.tabs.query({ url: url }, function(tabs) {
      _.each(tabs, function(tab) {
        chrome.tabs.update(tab.id, { url: chrome.extension.getURL("/pill.html") });
      });
    });
  });
})(window.DinosaurPill);
