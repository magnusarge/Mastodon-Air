var browserName = detectBrowser();
if ( browserName == 'firefox' ) var chrome = browser;

// Fill background color cells
$.each( themeBackgrounds, function( key, value ) {
     let radio = $(`<label class="colorContainer"><input type="radio" name="themeBg" value="${key}"><span style="background: ${value.color}" class="themeCheck" title="${value.title}"></span></label>`);
    $('#themeBg').append(radio);
});

//Fill accent color cells
$.each( themeBackgrounds, function( key, value ) {
    let radio = $(`<label class="colorContainer"><input type="radio" name="accent" value="${key}"><span style="background: ${value.color}" class="themeCheck" title="${value.title}"></span></label>`);
    $('#accentColor').append(radio);
});
 
// Put the checkboxes in right place etc
function restoreOptions() {
    function setCurrentThemeBg(result) {
        let themeBg = themeBackgrounds.DefaultDark;
        if ( result.themeBg ) {
            themeBg = result.themeBg;
        } else chrome.storage.local.set({themeBg: themeBg});
        $(`#themeBg input[value='${themeBg.title}']`).prop( "checked", true );
        previewBg(themeBg);
    }
    function setTextColor(result) {
        let val = "light";
        if ( result.textColor ) {
            val = result.textColor;
        } else chrome.storage.local.set({textColor: val});
        $(`#textColor input[value='${val}']`).prop( "checked", true );
        previewText(val);
    }
    function setAccentColor(result) {
        let val = themeBackgrounds.SlateBlue;
        if ( result.accentColor ) {
            val = result.accentColor;
        } else chrome.storage.local.set({accentColor: val});
        $(`#accentColor input[value='${val.id}']`).prop( "checked", true );
        previewAccent(val);
    }
    function setLogoAccent(result) {
        let val = true;
        if ( result.logoAccent || result.logoAccent == false ) {
            val = result.logoAccent;
        } else chrome.storage.local.set({logoAccent: val});
        $("#logoAccent").prop( "checked", val );
    }
    function setKeepWideText(result) {
        let val = true;
        if ( result.keepWideText || result.keepWideText == false ) {
            val = result.keepWideText;
        } else chrome.storage.local.set({keepWideText: val});
        $("#keepWideText").prop( "checked", val );
    }
    function setHideTrends(result) {
        let val = false;
        if ( result.hideTrends || result.hideTrends == false ) {
            val = result.hideTrends;
        } else chrome.storage.local.set({hideTrends: val});
        $( "#hideTrends" ).prop( "checked", val );
    }
    function setHideAboutLinks(result) {
        let val = false;
        if ( result.hideAboutLinks || result.hideAboutLinks == false ) {
            val = result.hideAboutLinks;
        } else chrome.storage.local.set({hideAboutLinks: val}); 
        $( "#hideAboutLinks" ).prop( "checked", val );
    }
    function setAirEnabled(result) {
        let val = true;
        if ( result.airEnabled || result.airEnabled == false ) {
            val = result.airEnabled;
        } else chrome.storage.local.set({airEnabled: val}); 

        $( "#airEnabled" ).prop( "checked", val );
    }
    function onError(error) {
        //console.log(`Error: ${error}`);
    }

    let gettingAirEnabled = chrome.storage.local.get("airEnabled");
    gettingAirEnabled.then(setAirEnabled, onError);
  
    let gettingThemeBg = chrome.storage.local.get("themeBg");
    gettingThemeBg.then(setCurrentThemeBg, onError);

    let gettingTextColor = chrome.storage.local.get("textColor");
    gettingTextColor.then(setTextColor, onError);

    let gettingAccentColor = chrome.storage.local.get("accentColor");
    gettingAccentColor.then(setAccentColor, onError);

    let gettingLogoAccent = chrome.storage.local.get("logoAccent");
    gettingLogoAccent.then(setLogoAccent, onError);

    let gettingHideTrends = chrome.storage.local.get("hideTrends");
    gettingHideTrends.then(setHideTrends, onError);

    let gettingHideAboutLinks = chrome.storage.local.get("hideAboutLinks");
    gettingHideAboutLinks.then(setHideAboutLinks, onError);

    let gettingKeepWideText = chrome.storage.local.get("keepWideText");
    gettingKeepWideText.then(setKeepWideText, onError);

}

function previewBg(bg) {
    $("#selectedColor").text("#"+bg.title);
    $("#preview").css("background",bg.color);
    $("body").css("background", bg.color);
    $("#preview").css("border-color",bg.accent);
    previewText($("input[name='mode']:checked").val());
    previewAccent(themeBackgrounds[bg.accent]);
}
function previewText(color) {
    $("#preview").removeClass("dark light");
    $("#preview").addClass(color);
    $("body").css("color", color=="dark"?"black":"white");
}
function previewAccent(accent) {
    $("#selectedAccent").text("#"+accent.title);
    $(".accentColor").css("color", accent.color);
    $("#selectedColor").css("color", accent.color);
    $(".accentBackground").css("background", accent.color);
    $(".accentBackground").css("color", accent.text == "dark" ? "black" : "white");
}

function saveTheme(bg, textcolor) {
    chrome.storage.local.set({
        themeBg: bg
    });
}
function saveAccentColor(accentcolor) {
    chrome.storage.local.set({
        accentColor: accentcolor
    });
}
function saveTextColor(textcolor) {
    chrome.storage.local.set({
        textColor: textcolor
    });
}


$("#themeBg .colorContainer").click( function() {
    let bg = themeBackgrounds[$("input[name='themeBg']", this).val()];
    $(`#textColor input[value='${bg.text}']`).prop( "checked", true );
    $(`#accentColor input[value='${bg.accent}']`).prop( "checked", true );
    saveTheme(bg);
    saveAccentColor(themeBackgrounds[bg.accent]); 
    saveTextColor(bg.text);
    previewBg(bg);
});
$("#accentColor .colorContainer").click( function() {
    let accent = themeBackgrounds[$("input[name='accent']", this).val()];
    chrome.storage.local.set({
        accentColor: accent
    });
    previewAccent(accent);
});
$("#textColor .modeContainer").click( function() {
    let textcolor = $("input[name='mode']", this).val();
    let bg = themeBackgrounds[$("input[name='themeBg']:checked").val()];
    saveTextColor(textcolor);
    previewText(textcolor);
});
$("#logoAccent").click( function() {
    chrome.storage.local.set({
        logoAccent: $("#logoAccent:checked").length ? true : false
    });
});
$("#hideTrends").click( function() {
    chrome.storage.local.set({
        hideTrends: $("#hideTrends:checked").length ? true : false
    });
});
$("#hideAboutLinks").click( function() {
    chrome.storage.local.set({
        hideAboutLinks: $("#hideAboutLinks:checked").length ? true : false
    });
});
$("#airEnabled").click( function() {
    chrome.storage.local.set({
        airEnabled: $("#airEnabled:checked").length ? true : false
    });
});
$("#keepWideText").click( function() {
    chrome.storage.local.set({
        keepWideText: $("#keepWideText:checked").length ? true : false
    });
});


addEventListener('DOMContentLoaded', (event) => {

    function showTabs(ids, index) {
      
      // Convert ids to array if needed
      if ( Array.isArray(ids) == false ) {
        ids = new Array(ids);
      }
      // For each tab container there is
      ids.forEach( ( id ) => {
        
        let container = document.getElementById(id);
        
        if ( container ) {
          
          let tabs = container.querySelectorAll( ".tab" );
          let tabContents = container.querySelectorAll( ".tabContent" );
          
          // If tabs and contents count differs, we want smaller number, otherwise we run out of bounds.
          let maxIterate = Math.min(tabs.length, tabContents.length);
          //console.log(maxIterate);
  
          // If selected tab has bigger nuber than we can give
          index = index > maxIterate ? maxIterate : index;
          
          for ( let i = 0; i < maxIterate; i++ ) {
            let tab = tabs[i];
            let content = tabContents[i];
  
            tab.classList.remove("active");
            content.style.display = "none";
            content.style.visibility = "hidden";
  
            tabs[i].onclick = function() { showTabs(id, i) };
  
            if ( i == index ) {
              tab.classList.add("active");
              content.style.display = "block";
              content.style.visibility = "visible";
            }
          }
        }
      });
    }

    showTabs("tabs", 0);
    restoreOptions();
  
  });