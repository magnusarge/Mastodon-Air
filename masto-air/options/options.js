var browserName = detectBrowser();
if ( browserName == 'firefox' ) var chrome = browser;

$.each( themeBackgrounds, function( key, value ) {
     let radio = $(`<label class="colorContainer"><input type="radio" name="themeBg" value="${key}"><span style="background: ${value.color}" class="themeCheck" title="${value.title}"></span></label>`);
    $('#themeBg').append(radio);
});
// $.each( darkBackgrounds, function( key, value ) {
//     let radio = $(`<label class="colorContainer"><input type="radio" name="themeDark" value="${key}"><span style="background: ${key}" class="themeCheck" title="${value}"></span></label>`);
//    $('#themeDark').append(radio);
// });


// function saveOptions(e) {
//     e.preventDefault();
//     chrome.storage.local.set({
//       themeLight: $("input[name='themeLight']:checked").val(),
//       themeDark: $("input[name='themeDark']:checked").val(),
//       hideTrends: $("#hideTrends:checked").val(),
//       hideAboutLinks: $("#hideAboutLinks:checked").val(),
//       airEnabled: $("#airEnabled:checked").val()
//     });
// }
  
function restoreOptions() {
    function setCurrentThemeBg(result) {
        let themeBg = themeBackgrounds.DefaultDark;
        if ( result.themeBg ) {
            themeBg = result.themeBg;
        }
        // let val = result.themeBg.title || "DefaultDark";
        // let color = themeBackgrounds[val];
        $(`#themeBg input[value='${themeBg.title}']`).prop( "checked", true );
        previewBg(themeBg.color, themeBg.title);
    }
    // function setCurrentThemeDark(result) {
    //     let val = result.themeDark || "default";
    //     $(`#themeDark input[value='${val}']`).prop( "checked", true );
    // }
    function setThemeMode(result) {
        if ( !result.themeMode ) {
            result.themeMode = "light";
        }
        let val = result.themeMode || "light";
        $(`#themeMode input[value='${val}']`).prop( "checked", true );
        previewText(val);
    }
    function setHideTrends(result) {
        let val = result.hideTrends || false;
        $( "#hideTrends" ).prop( "checked", val );
    }
    function setHideAboutLinks(result) {
        let val = result.hideAboutLinks || false;
        $( "#hideAboutLinks" ).prop( "checked", val );
    }
    function setAirEnabled(result) {
        if ( result.airEnabled == 'undefined' ) {
            chrome.storage.local.set({airEnabled: false});
            chrome.storage.local.set({airEnabled: true});
        }
        let val = result.airEnabled || true;
        $( "#airEnabled" ).prop( "checked", val );
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }
  
    let gettingThemeBg = chrome.storage.local.get("themeBg");
    gettingThemeBg.then(setCurrentThemeBg, onError);

    // let gettingThemeDark = chrome.storage.local.get("themeDark");
    // gettingThemeDark.then(setCurrentThemeDark, onError);

    let gettingThemeMode = chrome.storage.local.get("themeMode");
    gettingThemeMode.then(setThemeMode, onError);

    let gettingHideTrends = chrome.storage.local.get("hideTrends");
    gettingHideTrends.then(setHideTrends, onError);

    let gettingHideAboutLinks = chrome.storage.local.get("hideAboutLinks");
    gettingHideAboutLinks.then(setHideAboutLinks, onError);

    let gettingAirEnabled = chrome.storage.local.get("airEnabled");
    gettingAirEnabled.then(setAirEnabled, onError);

}

function previewBg(bg, title) {
    $("#selectedColor").text(title);
    $("#preview").css("background",bg);
    previewText($("input[name='mode']:checked").val());
}
function previewText(color) {
    $("#preview").removeClass("dark light");
    $("#preview").addClass(color);
}

//chrome.storage.local.set({themeMode: ""});

//document.querySelector("form").addEventListener("submit", saveOptions);
document.addEventListener("DOMContentLoaded", restoreOptions);

$("#themeBg .colorContainer").click( function() {
    let value = themeBackgrounds[$("input[name='themeBg']", this).val()];
    chrome.storage.local.set({
        themeBg: value
    });
    chrome.storage.local.set({
        themeMode: value.text
    });
    $(`#themeMode input[value='${value.text}']`).prop( "checked", true );
    
    previewBg(value.color, value.title);
});
// $("#themeDark .colorContainer").click( function() {
//     chrome.storage.local.set({
//         themeDark: $("input[name='themeDark']", this).val()
//     });
// });
$("#themeMode .modeContainer").click( function() {
    let textcolor = $("input[name='mode']", this).val();
    previewText(textcolor);
    chrome.storage.local.set({
        themeMode: textcolor
    });
});
$("#hideTrends").click( function() {
    chrome.storage.local.set({
        hideTrends: $("#hideTrends:checked").val()
    });
});
$("#hideAboutLinks").click( function() {
    chrome.storage.local.set({
        hideAboutLinks: $("#hideAboutLinks:checked").val()
    });
});
$("#airEnabled").click( function() {
    chrome.storage.local.set({
        airEnabled: $("#airEnabled:checked").val()
    });
});