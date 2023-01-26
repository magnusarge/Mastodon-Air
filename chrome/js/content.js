/**
 * content.js
 * Mastodon Air
 * Author: Magnus Arge
 * Created: 17.12.2022
 */

let browserName = detectBrowser();
if ( browserName == 'firefox' ) var chrome = browser;
//let version = chrome.runtime.getManifest().version;
let mastodonState = {};
const isMastodon = isMastodonInstance();
const isSignedIn = isUserSignedIn();
// For injecting <style>
const nonce = $(`meta[name="style-nonce"]`).attr("content");
let air = {
  enabled: true,
  initialTheme: "", // Theme that is underneath of Air
  logoFill: [], // Original colors for logo
  logoAccent: false, // Default value for overriding default logo colors
  background: "", // Air background
  accent: "", // Air accent color
  textColor: "", // Air text color ( 'dark' || 'light' )
  keepWideText: true, // Keep textarea wide even if Air is disabled
  wideColumns: false
}

function isMastodonInstance() {
  const initialState = $("#initial-state");
  if ( initialState.length ) {

    mastodonState = JSON.parse(initialState[0].innerHTML);
    let repository = mastodonState.meta.repository;
    let version = mastodonState.meta.version;

    // const repositoryExists = initialState[0].innerHTML.includes("repository");
    // const mastodonExists = initialState[0].innerHTML.includes("mastodon");

    const repositoryExists = repository.length;
    const mastodonExists = version[0] == 4; 

    if ( repositoryExists && mastodonExists ) {
          const mastodonAppBodyExists = $("body.app-body").first();
          const mastodonIdExists = $("div#mastodon").first();
          const mastodonThemesExists =
            $("body.theme-contrast").first() ||
            $("body.theme-default").first() ||
            $("body.theme-mastodon-light").first();
        return mastodonIdExists && mastodonThemesExists && mastodonAppBodyExists ? true : false;
    }
  }
  return false;
}
function isUserSignedIn() {
  if ( !isMastodon ) return false;
  //console.log('Mastodon instance detected.');
  return $(".navigation-panel__sign-in-banner").length ? false : true;
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if ( oldValue != newValue ) {
      if ( key == "airEnabled" ) {
        startEngine();
      }
      if ( key == "keepWideText" ) wideTextEditor();
      if ( key == "hideTrends" ) hideTrends();
      if ( key == "hideAboutLinks" ) hideAboutLinks();
      if ( key == "wideColumns" ) wideColumnsOnAdvancedMode();
    }
  }
});

function onError(error) {
  //console.log(`Error: ${error}`);
}

function setDefaults() {
  chrome.storage.local.set({
    themeBg:"",
    hideTrends:false,
    hideAboutLinks:false,
    textColor:"",
    accentColor:"",
    logoAccent:true,
    keepWideText:true,
    wideColumns:false,
    dontChangeAccent:false
  });
  chrome.storage.local.set({airEnabled: true});
}
function wideTextEditor(forceRemove=false) {
  if ( forceRemove ) {
    $("body.app-body").removeClass("air-disabled");
    return;
  }

  let keepWideText = chrome.storage.local.get("keepWideText");
  keepWideText.then(keepWideTextCheck, onError);

  function keepWideTextCheck(item) {
    if ( item.keepWideText || item.keepWideText == false ) {
      if ( item.keepWideText ) {
        air.keepWideText = true;
        $("body.app-body").addClass("air-disabled");
      } else {
        air.keepWideText = false;
        $("body.app-body").removeClass("air-disabled");
      }
    }
  }
}
function wideColumnsOnAdvancedMode() {
  const gettingWideColumns = chrome.storage.local.get("wideColumns");
  gettingWideColumns.then(wideColumnsCheck, onError);

  function wideColumnsCheck(item) {
    if ( item.wideColumns ) {
      $("#mastodon").addClass("wideColumns");
    } else {
      $("#mastodon").removeClass("wideColumns");
    }
  }
}
function hideTrends() {
  const gettingHideTrends = chrome.storage.local.get("hideTrends");
  gettingHideTrends.then(hideTrendsCheck, onError);

  function hideTrendsCheck(item) {
    if ( item.hideTrends ) {
      $("#mastodon").addClass("hideTrends");
    } else {
      $("#mastodon").removeClass("hideTrends");
    }
  }
}
function hideAboutLinks() {
  const gettingHideAboutLinks = chrome.storage.local.get("hideAboutLinks");
  gettingHideAboutLinks.then(hideAboutLinksCheck, onError);

  function hideAboutLinksCheck(item) {
    if ( item.hideAboutLinks ) {
      $("#mastodon").addClass("hideAboutLinks");
    } else {
      $("#mastodon").removeClass("hideAboutLinks");
    }
  }
}
function startEngine() {
  function airEnabledCheck(item) {
    if ( item.airEnabled ) {
        //console.log("Mastodon Air enabled");
        air.enabled = true;
        airIsEnabled();
    } else if ( item.airEnabled == false ) {
      //console.log("Mastodon Air disabled");
      air.enabled = false;
      airIsDisabled();
    } else {
      // First run. Set values and wait for onchange listener
      //console.log("Enabling Air for first time run.");
      setDefaults();
    }
  }
  if ( isMastodon ) {
    let airEnabled = chrome.storage.local.get("airEnabled");
    airEnabled.then(airEnabledCheck, onError);
  }
}
function addOptionsLink() {
  
  if ( !$("#airoptions").length ) { // Check if link already exists
    let firefoxPath = browserName == 'firefox' ? "/chrome/" : "";
    let optionsUrl = chrome.runtime.getURL(`${firefoxPath}options/options.html`);
    let optionsLink = $(`<a id="airoptions" class="column-link column-link--transparent" title="Mastodon Air options" href="${optionsUrl}" target="_blank"><i class="fa fa-diamond column-link__icon fa-fw"></i><span>Theme options</span></a>`);
    // .navigation-panel__legal must appear first
    setTimeout(function() {
      $(optionsLink).insertBefore($("body.app-body #mastodon .navigation-panel__legal").first()); 
      
      $("body.app-body.layout-multiple-columns").first().append(optionsLink);
    }, 100);
  }
}
function logoAccentColor(accentcolor) {
    if ( accentcolor == false || air.enabled == false ) accentcolor = air.logoFill[0];
    // Safari has issue with updating svg styles from css
    $("symbol#logo-symbol-wordmark path:nth-child(1)").css("fill",accentcolor);

    let cssText = `symbol#logo-symbol-wordmark path:nth-child(1) {fill:${accentcolor}}`;
    setTimeout(function() {
      toggleStyles("air-logo-accent", cssText);
    }, 1000);
}
function logoTextColor(textcolor) {
  let eyecolor = textcolor;
  if ( textcolor == false || air.enabled == false ) {
    eyecolor = air.logoFill[1];
    textcolor = air.logoFill[2];
  }
  // Safari has issue with updating svg styles from css
  $("symbol#logo-symbol-wordmark path:nth-child(2)").css("fill",eyecolor);
  $("symbol#logo-symbol-wordmark path:nth-child(3)").css("fill",textcolor);
  
  let cssText = `
  symbol#logo-symbol-wordmark path:nth-child(2) {fill:${eyecolor}}
  symbol#logo-symbol-wordmark path:nth-child(3) {fill:${textcolor}}
  `;
    setTimeout(function() {
      toggleStyles("air-logo-text", cssText);
    }, 1000);
}
if ( isMastodon ) {
  // Add options link regardless Air is enabled or not, logged in or not.
  addOptionsLink();
  hideTrends();
  hideAboutLinks();
  wideColumnsOnAdvancedMode();

  startEngine();
}

function toggleStyles(id, content) {
  $(`#${id}`).remove();
  let el = $(`<style nonce="${nonce}" id="${id}" type="text/css"></style>`);
  el.text(content);
  $("head").append(el);
}

// Clean up and return to regular Mastodon
function airIsDisabled() {
  logoAccentColor(false);
  logoTextColor(false);
  wideTextEditor();

  $("body.app-body.air").css("background", "");
  $("body.app-body.air .tabs-bar__wrapper").css("background", "");
  $("body.app-body.air .ui__header").css("background", "");
  $("body.app-body").removeClass("air");
  $("head style#air-scrollbars").remove();
  $("head style#air-accent").remove();
  $("head style#air-theme").remove();
  $("head style#air-logo-text").remove();
  $("head style#air-logo-accent").remove();
}
// Run Mastodon Air
function airIsEnabled () {

  wideTextEditor(true);
  $("body.app-body").addClass("air");
  //console.log(`Signed in: ${isSignedIn}`);
  //console.log(`Browser: ${browserName}`);

  initTheme();

  function initTheme() {
    // Lets write down what the Mastodon's theme is
    if ( air.initialTheme == "" ) { // Only first time!
      let classList = $("body").attr('class').split(/\s+/);
      let themeList = ["theme-default","theme-mastodon-light"];
      $.each(themeList, function(index, item) {
        if ( $.inArray(item, classList) > -1 ) {
          air.initialTheme = item;
          //console.log("Factory theme: "+air.initialTheme);
          return;
        }
      });
    }
    if ( air.logoFill.length < 3 ) {
      // Save initial logo colors
      air.logoFill.push(
        $("symbol#logo-symbol-wordmark path:nth-child(1)").css("fill"),
        $("symbol#logo-symbol-wordmark path:nth-child(2)").css("fill"),
        $("symbol#logo-symbol-wordmark path:nth-child(3)").css("fill")
      );
    }

    checkTextColor();
    themeColor();
    checkAccentColor();

  }
  function themeColor() {
    const gettingThemeBg = chrome.storage.local.get("themeBg");//theme);
    gettingThemeBg.then(onThemeBg, onError);

    function onThemeBg(item) {
      let bgtheme = "default";
      let scrollForeground = "black";
  
      if ( !item.themeBg ) {
        //console.log("Theme background nil, falling to defaults.");
        if ( air.initialTheme == "theme-mastodon-light" ) {
          item.themeBg = themeBackgrounds.DefaultLight;
        } else {
          item.themeBg = themeBackgrounds.DefaultDark;
        }
        chrome.storage.local.set({themeBg: item.themeBg});
      }
  
      if (item.themeBg.color) {
        bgtheme = item.themeBg.color;
      }
      if (item.themeBg.title) {
        //console.log(`Air theme background is ${item.themeBg.title}`);
      }
      if (item.themeBg.text) {
        scrollForeground = item.themeBg.text == "light" ? "white" : "black";
      }
  
      let color = bgtheme == "default" ? "" : bgtheme;
      air.background = color;
  
      // Styles for scrollbar
      let scrollbars = `
      body::-webkit-scrollbar {width: 12px;}
      html, body {
        scrollbar-color: ${scrollForeground} ${color};
      }
      body::-webkit-scrollbar-track {
        background: ${color};
      }
      body::-webkit-scrollbar-track:hover {
        background: ${color};
      }
      body::-webkit-scrollbar-thumb {
        background-color: ${scrollForeground} ;
        border-radius: 6px;
        border: 0;
      }`;
      toggleStyles("air-scrollbars", scrollbars);
  
      // Styles for background
      let themeBackground = `
      body.app-body.air,
      body.app-body.air .tabs-bar__wrapper,
      body.app-body.air .ui__header {
        background: ${color} !important;
      }
      `;
      toggleStyles("air-theme", themeBackground);    
    }

  }
  // Check text color
  function checkTextColor() {
    const gettingTextColor = chrome.storage.local.get("textColor");
    gettingTextColor.then(textColor, onError);

    function textColor(item) {
      let textColor = "";
      let msg = "Text color is";
  
      if ( !item.textColor ) {
        //console.log("Text color is empty!");
      } else {
        textColor = item.textColor;
        msg = `${msg} confirmed`;
      } 
  
      // Airs textColor isn't set, trying to mimic Mastodon's initial values
      if (textColor != "light" && textColor != "dark" ) {
          if ( air.initialTheme == "theme-mastodon-light" ) {
            textColor = "dark";
          } else {
            textColor = "light";
          }
          msg = `${msg} forced`;
          chrome.storage.local.set({textColor: textColor});
      }
      //console.log(`${msg} ${textColor}`);
      air.textColor = textColor;
  
      $("body").removeClass("theme-default theme-mastodon-light");
  
      let theme = textColor == "dark" ? "theme-mastodon-light" : "theme-default";
      $("body").addClass(`${theme}`);
  
      logoTextColor(textColor=="dark"?"black":"white");
    }
  }
  // Check accent color
  function checkAccentColor() {
    const gettingAccentColor = chrome.storage.local.get("accentColor");
    gettingAccentColor.then(accentColor, onError);

    function accentColor(item) {
      let accentColor = themeBackgrounds.RoyalBlue;
      let msg = "Accent color is";
  
      if ( !item.accentColor ) {
        //console.log("Accent color is empty!");
        chrome.storage.local.set({accentColor: accentColor});
      } else {
        accentColor = item.accentColor;
        msg = `${msg} confirmed`;
      } 
      accentColor.text = accentColor.text == "dark" ? "black" : "white";
      //console.log(`${msg} ${accentColor.title}`);
  
      air.accent = accentColor.color;
      // Logo accent color change goes through permission check
      checkLogoAccent();
  
      let accentStyles = 
      `body.air #mastodon .trends__item__sparkline path:last-child
        {stroke: ${accentColor.color} !important;}
      body.air #mastodon .trends__item__sparkline path:first-child
        {fill: ${accentColor.color} !important;}
      body.air.theme-mastodon-light #mastodon .notification.unread::before,
      body.air.theme-mastodon-light #mastodon .status__wrapper.unread::before
        {border-left-color: ${accentColor.color} !important;}
      body.air #mastodon .button.disabled,
      body.air #mastodon .button:disabled,
      body.air #mastodon .react-toggle--checked .react-toggle-track,
      body.air #mastodon .button,
      body.air #mastodon .radio-button__input.checked,
      body.air .language-dropdown__dropdown__results__item.active,
      body.air .dropdown-menu__item a:active,
      body.air .dropdown-menu__item a:focus,
      body.air .dropdown-menu__item a:hover,
      body.air .dropdown-menu__item button:active,
      body.air .dropdown-menu__item button:focus,
      body.air .dropdown-menu__item button:hover,
      body.air .privacy-dropdown__option.active,
      body.air .privacy-dropdown__option:hover,
      body.air #mastodon .poll__chart,
      body.air #mastodon .compose-form__sensitive-button .checkbox.active,
      body.air #mastodon .rules-list li::before,
      body.air #mastodon .prose ul > li::before
        {background: ${accentColor.color} !important;}
      body.air #mastodon .compose-form__sensitive-button .checkbox,
      body.air #mastodon .compose-form__sensitive-button .checkbox.active
        {border-color: ${accentColor.color} !important;}
      body.air #mastodon .columns-area__panels__main .status__content a,
      body.air #mastodon .prose a
        {color: ${accentColor.color} !important;}
      body.air #mastodon .button,
      body.air #mastodon .button.button-alternative-2,
      body.air #mastodon .rules-list li::before
        {color: ${accentColor.text} !important;}
      @media screen and (max-width: 889px) {
        body.air #mastodon .column-link--transparent.active {
          color: ${accentColor.color} !important;
        }
      }
        `;
      toggleStyles("air-accent", accentStyles);
    }
  }
  // Check if is allowed to change logo color. Default is true.
  function checkLogoAccent() {
    const gettingLogoAccent = chrome.storage.local.get("logoAccent");
    gettingLogoAccent.then(logoAccent, onError);

    function logoAccent(item) {
      if ( item.logoAccent ) {
        logoAccentColor(air.accent);
      } else if ( item.logoAccent == false ) {
        logoAccentColor(false);
      }
    }
  }

  // Stored properties change listener
  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if ( oldValue != newValue ) {
        if ( key == "themeBg" ) themeColor();
        if ( key == "textColor" ) checkTextColor();
        if ( key == "accentColor" ) checkAccentColor();
        if ( key == "logoAccent" ) checkLogoAccent();
      }
    }
  });

} // Mastodon Air



