chrome.tabs.onActivated.addListener(function(status) {
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

chrome.webNavigation.onBeforeNavigate.addListener(function(nav) {
  window.DinosaurPill.attemptToLookAt(new window.DinosaurPill.LookingAt({
    uri: nav.url,
    tabID: nav.tabId,
    timestamp: Date.now()
  }));
});

chrome.webNavigation.onTabReplaced.addListener(function(nav) {
  chrome.tabs.get(nav.tabId, function(tab) {
    window.DinosaurPill.attemptToLookAt(window.DinosaurPill.LookingAt.fromTab(tab));
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(nav) {
  window.DinosaurPill.attemptToLookAt(new window.DinosaurPill.LookingAt({
    uri: nav.url,
    tabID: nav.tabId,
    timestamp: Date.now()
  }));
});
