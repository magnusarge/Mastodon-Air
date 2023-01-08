var browserName = detectBrowser();
if ( browserName == 'firefox' ) var chrome = browser;

// Fill background color cells
$.each( themeBackgrounds, function( key, value ) {
     let radio = $(`<label class="colorContainer"><input type="radio" name="themeBg" value="${key}"><span style="background: ${value.color}" class="themeCheck" title="${value.title}"></span></label>`);
    $('#themeBg').append(radio);
});

//Fill accent color cells
// $.each( accentColors, function() {
//     let color = themeBackgrounds[this];
//     console.log(color.id);
//     let radio = $(`<label class="colorContainer"><input type="radio" name="accent" value="${color.id}"><span style="background: ${color.color}" class="themeCheck" title="${color.title}"></span></label>`);
//     $('#accentColor').append(radio);
// });
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
        }
        $(`#themeBg input[value='${themeBg.title}']`).prop( "checked", true );
        previewBg(themeBg);
    }
    function setTextColor(result) {
        let val = result.textColor || "light";
        $(`#textColor input[value='${val}']`).prop( "checked", true );
        previewText(val);
    }
    function setAccentColor(result) {
        let val = result.accentColor || "SlateBlue";
        $(`#accentColor input[value='${val.id}']`).prop( "checked", true );
        previewAccent(val);
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

    let gettingTextColor = chrome.storage.local.get("textColor");
    gettingTextColor.then(setTextColor, onError);

    let gettingAccentColor = chrome.storage.local.get("accentColor");
    gettingAccentColor.then(setAccentColor, onError);

    let gettingHideTrends = chrome.storage.local.get("hideTrends");
    gettingHideTrends.then(setHideTrends, onError);

    let gettingHideAboutLinks = chrome.storage.local.get("hideAboutLinks");
    gettingHideAboutLinks.then(setHideAboutLinks, onError);

    let gettingAirEnabled = chrome.storage.local.get("airEnabled");
    gettingAirEnabled.then(setAirEnabled, onError);

}

function previewBg(bg) {
    $("#selectedColor").text(bg.title);
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
    $("#selectedAccent").text(accent.title);
    $(".accentColor").css("color", accent.color);
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

document.addEventListener("DOMContentLoaded", restoreOptions);

// $("#selectedAccent").click( function() {
//     let text = $("#selectedAccent").text();
//     let textcolor = $("#selectedAccent").css("color");
//     navigator.clipboard.writeText(text);
//     $("#selectedAccent").css("color","silver");
//     setTimeout(function() {
//         $("#selectedAccent").css("color",textcolor);
//       }, 100);
// })
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

$(document).ready(function(){
    $(".tabContent").css({"display":"none","visibility":"hidden"});
    $("#tabContainer .tabContent:nth-child(1)").css({"display":"block","visibility":"visible"});
    $("a.tab").click( function(e) {
        var nth = $(this).index()+1;
        //console.log("This is is "+nth);
        $("a.tab").removeClass("active");
        $(this).addClass("active");
        $(".tabContent").css({"display":"none","visibility":"hidden"});
        $("#tabContainer .tabContent:nth-child("+nth+")").css({"display":"block","visibility":"visible"});
    });
});