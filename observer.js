chrome.tabs.onActivated.addListener(function(status) {
  console.log(status);

  chrome.tabs.get(status.tabId, function(tab) {
    window.DinosaurPill.lookAt(window.DinosaurPill.LookingAt.fromTab(tab));
  });
});

chrome.windows.onFocusChanged.addListener(function(windowID) {
  var query = {
    windowId:   windowID,
    windowType: "normal",
    active:     true
  };

  chrome.tabs.query(query, function(tabs) {
    if (!tabs || _.isEmpty(tabs)) {
      window.DinosaurPill.lookAt(window.DinosaurPill.LookingAt.NOTHING);
      return;
    }

    window.DinosaurPill.lookAt(window.DinosaurPill.LookingAt.fromTab(_.first(tabs)));
  });
});

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
  if (!changeInfo.url || !tab.active) {
    return;
  }

  chrome.windows.get(tab.windowId, function(win) {
    if (!win.focused) {
      return;
    }

    window.DinosaurPill.lookAt(window.DinosaurPill.LookingAt.fromTab(tab));
  });
});
