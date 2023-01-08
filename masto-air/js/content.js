/**
 * content.js
 * Mastodon Air
 * Author: Magnus Arge
 * Created: 17.12.2022
 */

let browserName = detectBrowser();
if ( browserName == 'firefox' ) var chrome = browser;
//let version = chrome.runtime.getManifest().version;
var debug = true;

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if ( key == "airEnabled" && oldValue != newValue ) {
      startEngine();
    }
  }
});

function say(output, canSay=true) {
  if ( debug && canSay ) console.log(output)
}

function onError(error) {
  say(`Error: ${error}`);
}

function startEngine() {
  function airEnabledCheck(item) {
    if ( item.airEnabled == 'undefined' ) {
      // First run. Set value and wait for onchange listener
      say("Enabling Air for first time run.");
      chrome.storage.local.set({airEnabled: true});
    } else {
      let canStart = item.airEnabled ? true : false;
      if ( canStart )
        airIsEnabled();
      else 
        airIsDisabled();
    }
  }
  let airEnabled = chrome.storage.local.get("airEnabled");
  airEnabled.then(airEnabledCheck, onError);
}

let firefoxPath = browserName == 'firefox' ? "/masto-air/" : "";
let optionsUrl = chrome.runtime.getURL(`${firefoxPath}options/options.html`);

function addOptionsLink() {
  if ( !$("#airoptions").length ) { 
    let optionsLink = $(`<a id="airoptions" class="column-link column-link--transparent" title="Mastodon Air options" href="${optionsUrl}" target="_blank"><i class="fa fa-diamond column-link__icon fa-fw"></i><span>Theme options</span></a>`);
    // .navigation-panel__legal must appear first
    setTimeout(function() {
      $(optionsLink).insertBefore($("body.app-body #mastodon .navigation-panel__legal").first());  
    }, 100);
  }
}
addOptionsLink();
startEngine();

function airIsDisabled() {
  $("body").removeClass("air");
  $("body.app-body").css("background", "");
  $("body.app-body .tabs-bar__wrapper").css("background", "");
  $("body.app-body.air .ui__header").css("background", "");
  $("head style#airStyles").remove();
  say("Mastodon Air disabled");
}
function airIsEnabled () {

    const isMastodon = isMastodonInstance();
    const isSignedIn = isUserSignedIn();
    say("Mastodon Air enabled", isMastodon);

    function isMastodonInstance() {
      const initialState = $("#initial-state");
      if ( initialState.length ) {
          if ( initialState[0].innerHTML.includes("repository") && 
              initialState[0].innerHTML.includes("mastodon") ) {
              const mastodonIdExists = $("div#mastodon").first();
              const mastodonThemesExists = $("body.theme-contrast").first() ||
                  $("body.theme-default").first() ||
                  $("body.theme-mastodon-light").first();
              return mastodonIdExists && mastodonThemesExists ? true : false;
          }
      }
      return false;
    }
    function isUserSignedIn() {
      if ( !isMastodon ) return false;
      say('Mastodon instance detected.');
      return $(".navigation-panel__sign-in-banner").length ? false : true;
    }

    if ( isMastodon === true ) { // Let assume that this is Mastodon page and user is logged in
    // ---------- Mastodon Air content.js ---------- //

      $("body").addClass("air");
      say(`Signed in: ${isSignedIn}`);
      say(`Browser: ${browserName}`);

      let initialTheme = "";

      checkTextColor();
      themeColor();
      checkAccentColor();
      checkHideTrends();
      checkAboutLinks();

      
      function initTheme() {
        // Lets write down what the Mastodon's theme is
        if ( initialTheme == "" ) { // Only first time!
          let classList = $("body").attr('class').split(/\s+/);
          let themeList = ["theme-default","theme-mastodon-light"];
          $.each(themeList, function(index, item) {
            if ( $.inArray(item, classList) > -1 ) {
              initialTheme = item;
              say("Factory theme: "+initialTheme);
              return;
            }
          });
        }
      }
      function themeColor() {
        // let classList = $("body").attr('class').split(/\s+/);
        // let themeList = ["theme-default","theme-mastodon-light"];
        // $.each(themeList, function(index, item) {
        //   if ( $.inArray(item, classList) > -1 ) {
        //     let theme = index === 0 ? "themeDark" : "themeLight";
        //     initialTheme = theme;
        //     say("Theme: "+theme);
            const gettingThemeBg = chrome.storage.local.get("themeBg");//theme);
            gettingThemeBg.then(onThemeBg, onError);
        //     return;
        //   }
        // });
      }
      function onThemeBg(item) {
        let bgtheme = "default";
        let scrollForeground = "black";
        // if ( initialTheme == "themeLight")
        //    { if (item.themeLight) theme = item.themeLight; }
        // if ( initialTheme == "themeDark")
        //    { if (item.themeDark) theme = item.themeDark; }
        if ( !item.themeBg ) {
          say("Theme background nil, falling to defaults.");
          if ( initialTheme == "theme-mastodon-light" ) {
            item.themeBg = themeBackgrounds.DefaultLight;
          } else {
            item.themeBg = themeBackgrounds.DefaultDark;
          }
        }

        if (item.themeBg.color) {
          bgtheme = item.themeBg.color;
        }
        if (item.themeBg.title) {
          say(`Air theme background is ${item.themeBg.title}`);
        }
        if (item.themeBg.text) {
          scrollForeground = item.themeBg.text == "light" ? "white" : "black";
        }

        let color = bgtheme == "default" ? "" : bgtheme;

        let airStyles = $('<style id="airStyles"></style>');
        airStyles.text(`
        body::-webkit-scrollbar {
          width: 12px;
        }
        html, body {
          /*scrollbar-width: thin;*/
          scrollbar-color: ${scrollForeground} ${color};
        }
        body::-webkit-scrollbar-track {
          background: ${color};
        }
        body::-webkit-scrollbar-thumb {
          background-color: ${scrollForeground} ;
          border-radius: 6px;
          border: 0;
        }
        `);
        //headStyles.text(`html{scrollbar-color:black ${color};}`);
        $("#airStyles").remove();
        $("head").append(airStyles);

        $("body.app-body.air").css("background", `${color}`);
        $("body.app-body.air .tabs-bar__wrapper").css("background", `${color}`);
        $("body.app-body.air .ui__header").css("background", `${color}`);
        setTimeout(function() {
          // If first time fails (happens on forced refresh)
          $("body.app-body.air .tabs-bar__wrapper").css("background", `${color}`); 
          $("body.app-body.air .ui__header").css("background", `${color}`);
        }, 100);     
      }
      function textColor(item) {
        let textColor = "";
        let msg = "Text color is";

        if ( !item.textColor ) {
          say("Text color is empty!");
        } else {
          textColor = item.textColor;
          msg = `${msg} confirmed`;
        } 

        if (textColor != "light" && textColor != "dark" ) {
            if ( initialTheme == "theme-mastodon-light" ) {
              textColor = "dark";
            } else {
              textColor = "light";
            }
            msg = `${msg} forced`;
        }
        say(`${msg} ${textColor}`);
        //airThemeMode = themeMode != "disabled";
        $("body").removeClass("theme-default theme-mastodon-light");
        //if (airThemeMode) {
          let theme = textColor == "dark" ? "theme-mastodon-light" : "theme-default";
          $("body").addClass(`${theme}`);
        //} else { $("body").addClass(initialTheme) }
      }
      function checkTextColor() {
        const gettingTextColor = chrome.storage.local.get("textColor");
        gettingTextColor.then(textColor, onError);
      }
      function accentColor(item) {
        let accentColor = {text:"light",color:"SlateBlue",title:"SlateBlue"};
        let msg = "Accent color is";

        if ( !item.accentColor ) {
          say("Accent color is empty!");
        } else {
          accentColor = item.accentColor;
          msg = `${msg} confirmed`;
        } 
        accentColor.text = accentColor.text == "dark" ? "black" : "white";
        say(`${msg} ${accentColor.title}`);

        let accentStyles = $('<style id="airAccent" type="text/css"></style>');
        accentStyles.text(`
        body.air #mastodon .react-toggle--checked .react-toggle-track,
        body.air #mastodon .button {
          background-color: ${accentColor.color} !important;
        }
        body.air #mastodon .trends__item__sparkline path:last-child {
          stroke: ${accentColor.color} !important;
        }
        body.air #mastodon .trends__item__sparkline path:first-child {
          fill: ${accentColor.color} !important;
        }
        body.air.theme-mastodon-light #mastodon .notification.unread::before,
        body.air.theme-mastodon-light #mastodon .status__wrapper.unread::before {
          border-left-color: ${accentColor.color} !important;
        }
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
        body.air #mastodon .poll__chart {
          background: ${accentColor.color} !important;
        }
        body.air #mastodon .button.disabled,
        body.air #mastodon .button:disabled {
          background-color: ${accentColor.color} !important;
        }
        body.air #mastodon .columns-area__panels__main .status__content a {
          color: ${accentColor.color} !important;
        }
        body.air #mastodon .compose-form__sensitive-button .checkbox,
        body.air #mastodon .compose-form__sensitive-button .checkbox.active {
          border-color: ${accentColor.color} !important;
        }
        body.air #mastodon .compose-form__sensitive-button .checkbox.active {
          background: ${accentColor.color} !important;
        }
        body.air #mastodon .button,
        body.air #mastodon .button.button-alternative-2 {
          color: ${accentColor.text} !important;
        }
        `);
        //headStyles.text(`html{scrollbar-color:black ${color};}`);
        $("#airAccent").remove();
        $(".app-body").append(accentStyles);

      }
      function checkAccentColor() {
        const gettingAccentColor = chrome.storage.local.get("accentColor");
        gettingAccentColor.then(accentColor, onError);
      }
      function hideTrends(item) {
        let hideTrends = false;
        if (item.hideTrends) {
          hideTrends = item.hideTrends;
        }
        let navigationPanel = $("#mastodon");
        if ( navigationPanel ) {
          if ( hideTrends ) navigationPanel.addClass("hideTrends");
          else navigationPanel.removeClass("hideTrends");
        }
      }
      function checkHideTrends() {
        const gettingHideTrends = chrome.storage.local.get("hideTrends");
        gettingHideTrends.then(hideTrends, onError);
      }
      function hideAboutLinks(item) {
        if (item.hideAboutLinks) $("#mastodon").addClass("hideAboutLinks");
        else $("#mastodon").removeClass("hideAboutLinks");
      }
      function checkAboutLinks() {
        const gettingHideAboutLinks = chrome.storage.local.get("hideAboutLinks");
        gettingHideAboutLinks.then(hideAboutLinks, onError);
      }

      chrome.storage.onChanged.addListener((changes, namespace) => {
        for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
          if ( key == "themeBg" && oldValue != newValue ) themeColor();
          if ( key == "hideTrends" && oldValue != newValue ) checkHideTrends();
          if ( key == "hideAboutLinks" && oldValue != newValue ) checkAboutLinks();
          if ( key == "textColor" && oldValue != newValue ) checkTextColor();
          if ( key == "accentColor" && oldValue != newValue ) checkAccentColor();
        }
      });      


    } //else say("Not Mastodon instance");// isSignedIn

} //else say("Mastodon Air disabled"); // airEnabled



