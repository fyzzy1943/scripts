// ==UserScript==
// @name         Pter Fitgirl release Uploady
// @namespace    https://pterclub.com/forums.php?action=viewtopic&topicid=3391
// @version      1.3.0
// @description  Game Uploady for Pterclub
// @author       NeutronNoir, ZeDoCaixao, scatking, ccf2012, fyzzy1943
// @match        https://pterclub.com/uploadgame.php*
// @match        https://pterclub.com/editgame.php*
// @require      https://cdn.staticfile.org/jquery/3.5.1/jquery.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @icon         https://pterclub.com/favicon.ico
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

const DESCR = $('#descr');

function html2bb(str) {
    if (!str) return "";
    str = str.replace(/< *br *\/*>/g, "\n\n"); //*/
    str = str.replace(/< *b *>/g, "[b]");
    str = str.replace(/< *\/ *b *>/g, "[/b]");
    str = str.replace(/< *u *>/g, "[u]");
    str = str.replace(/< *\/ *u *>/g, "[/u]");
    str = str.replace(/< *i *>/g, "[i]");
    str = str.replace(/< *\/ *i *>/g, "[/i]");
    str = str.replace(/< *strong *>/g, "[b]");
    str = str.replace(/< *\/ *strong *>/g, "[/b]");
    str = str.replace(/< *em *>/g, "[i]");
    str = str.replace(/< *\/ *em *>/g, "[/i]");
    str = str.replace(/< *li *>/g, "[*]");
    str = str.replace(/< *\/ *li *>/g, "");
    str = str.replace(/< *ul *class=\\*\"bb_ul\\*\" *>/g, "");
    str = str.replace(/< *\/ *ul *>/g, "");
    str = str.replace(/< *h2 *class=\"bb_tag\" *>/g, "\n[center][u][b]");
    str = str.replace(/< *h[12] *>/g, "\n[center][u][b]");
    str = str.replace(/< *\/ *h[12] *>/g, "[/b][/u][/center]\n");
    str = str.replace(/\&quot;/g, "\"");
    str = str.replace(/\&amp;/g, "&");
    str = str.replace(/< *img *src="([^"]*)".*>/g, "\n");
    str = str.replace(/< *a [^>]*>/g, "");
    str = str.replace(/< *\/ *a *>/g, "");
    str = str.replace(/< *p *>/g, "\n\n");
    str = str.replace(/< *\/ *p *>/g, "");
    //Yeah, all these damn stars. Because people put spaces where they shouldn't.
    str = str.replace(/??/g, "\"");
    str = str.replace(/??/g, "\"");
    str = str.replace(/  +/g, " ");
    str = str.replace(/\n +/g, "\n");
    str = str.replace(/\n\n\n+/gm, "\n\n");
    str = str.replace(/\n\n\n+/gm, "\n\n");
    str = str.replace(/\[\/b\]\[\/u\]\[\/align\]\n\n/g, "[/b][/u][/align]\n");
    str = str.replace(/\n\n\[\*\]/g, "\n[*]");
    return str;
}

function parseSteam(response) {
    var steamPage = response.responseText;
    // var steamPage = response;
    console.log(steamPage)

}


function parseFitgirRepack($document){
    console.log($document)
    var info1 = $document.querySelector("div[class='entry-content'] > p:nth-child(2)" );
    var info2_headerlist = $document.querySelectorAll("div[class='entry-content'] > h3" );

    if (!info1) {
      console.log("Not found: div[class='entry-content']");
      return
    }
    if (!info2_headerlist) {
      console.log("Not found: div[class='entry-content'] > h3[3]");
      return
    }
    var info1_bb = html2bb(info1.textContent)
    var foundFeature = Array.from(info2_headerlist).find(gg => (gg.textContent.indexOf('Feature')>0));
    // console.log(foundFeature)

    var info2_header_bb = html2bb(foundFeature.innerHTML); // "Repack Feature"
    var info2_list = foundFeature.nextSibling;
    while(info2_list && info2_list.nodeType != 1) {
      info2_list = info2_list.nextSibling;
    }
    if (!info2_list) {
      console.log("Not found: ul");
      return
    }
    var info2_list_bb = html2bb(info2_list.innerHTML);
    //   console.log(info2_list_bb)

    var dlc_bb = '';
    var dlc_header = Array.from($document.querySelectorAll("b")).find(gg => (gg.textContent.indexOf("Included DLCs") != -1));
    if (dlc_header) {
        var dlc_list = dlc_header.parentNode.nextSibling;
        while(dlc_list && dlc_list.nodeType != 1) {
            dlc_list = dlc_list.nextSibling;
        }
        if (dlc_list) {
            dlc_bb = html2bb(dlc_list.innerHTML);
        } else {
            console.log('found dlc anchor, not found dlc list, please check.');
        }
    }
    
    // Assembly torrent info
    var output = '' + info1_bb + '\n\n\n[b]' + info2_header_bb + '[/b]\n' +  info2_list_bb + '\n'

    if (dlc_bb != '') {
        output = output + '\n[b]Included DLCs:[/b]\n' + dlc_bb + '\n'
    }

    return output;
}


function getFitgirlTitle(doc) {
    var title = '';
    var h3_list = doc.querySelectorAll("div[class='entry-content'] > h3");
    var title_html = Array.from(h3_list).find(gg => (gg.textContent.indexOf("#") != -1));
    if (!title_html) {
        console.log("Not found: title_html");
        return title;
    }

    var title_match = title_html.innerHTML.match(/strong\>(.*)\<\/str/i);
    if (!title_match || title_match.length != 2) {
        console.log(title_html.innerHTML);
        console.log("title not match");
        return title;
    }

    title = title_match[1].replace(/\<span.*?"\>/i, "");
    title = title.replace(/\<\/span\>/i, "");
    console.log(title);

    return title;
}


function get1337xUrl(doc) {
    // var info2_headerlist = $document.querySelectorAll("div[class='entry-content'] > h3" );
    var url_e = doc.querySelector("div[class='entry-content'] > ul:nth-child(5) > li:first-child > a:first-child");
    if (!url_e) {
        console.log("1337x url get failed: div[class='entry-content'] > ul:nth-child(5) > li:first-child > a:first-child not found.");
        return '';
    }

    // console.log(url);
    var url = url_e.getAttribute('href');
    return url.indexOf('1337x') != -1 ? url : ''
}


function parseSteamLanguage($document){
    let table = $document.querySelector('table.game_language_options');

    if(!table) return;

    let languages = {};

    for (var r = 0; r < table.rows.length; r++) {
      for (var c = 0; c < table.rows[r].cells.length; c++) {
        if(table.rows[r].cells[c].textContent.trim() === '???'){
          let header = table.rows[0].cells[c].textContent.trim();
          if(!languages[header]) {
            languages[header] = [];
          }
          languages[header].push(table.rows[r].cells[0].textContent.trim());
        }
      }
    }
    let output = ''
    let keys = Object.keys(languages);

    for(var i = 0; i < keys.length; i++){
      let key = keys[i];
      let keygroup = [key];

      if(i < keys.length - 1){
        for(var iNext = i+1; iNext < keys.length; iNext){
          if(areSame(languages[keys[i]], languages[keys[iNext]])) {
            keygroup.push(keys[iNext]);
            keys.splice(iNext,1);
          } else {
            iNext++;
          }
        }
      }

      const multi = languages[key].length > 1;

      if(keys.length === 1){
        output += `[b]Language${multi ? "s": ""}[/b]: `;
      } else {
        output += `[b]${keygroup.join(' and ')} Language${multi ? "s": ""}[/b]: `;
      }

      if(multi){
        let lastItem = languages[key].pop();
        output += languages[key].join(', ');
        output += ` and ${lastItem}`;
      } else {
        output += languages[key];
      }
      output += '\n';
    }
    return output;
}


function areSame(array1, array2){
    return array1.length === array2.length && array1.sort().every((value, index) => value === array2.sort()[index])
}

// function editboxPart1(str) {
//     desc_field = "#descr";
//     var hidetext = '[hide=????????????]\n [*]?????? \"Verify BIN files before installation.bat\" ??????MD5??????????????????\n [*]?????? \"setup.exe\"????????????\n [*]????????????\n [*]??????????????????????????????????????????????????????????????????????????????[/hide]';

//     $(desc_field).val(hidetext + '\n\n' + str + $(desc_field).val());
// }

function editboxPart2(fitgirl_info) {
    var text = '[hide=????????????]\n [*]?????? \"Verify BIN files before installation.bat\" ??????MD5??????????????????\n [*]?????? \"setup.exe\"????????????\n [*]????????????\n [*]??????????????????????????????????????????????????????????????????????????????[/hide]';

    text = text + '\n\n[font=sans-serif]'

    text = text + '\n\n';
    text = text + '=+=LanguageAnchor=+=' + '\n\n';
    text = text + fitgirl_info;

    text = text + '[/font]';

    desc_field = "#descr";
    var origin_text = $(desc_field).val();
    $(desc_field).val(text + origin_text);
}


function changeStatus(msg) {
    $('#pfru_status').html(' >>' + msg);
}


function parse1337Language(doc) {
    // console.log(doc);
    if (!doc) {
        return;
    }
    var html1 = doc.querySelector("div[class='torrent-tabs']");
    if (!html1) {
        return;
    }

    html1 = html1.textContent;
    // console.log(html1);

    var lang = html1.match(/(Interface Language[\s\S]*?)Crack/im);
    if (!lang || lang.length != 2) {
        console.log(lang);
        return;
    }

    lang = lang[1].trim()
                .replace(/\s+/g, ' ')
                .replace(/Audio Language/g, '\nAudio Language')
                .replace(/, /g, '???')
                .replace(/Interface Language/g, '[b]????????????[/b]')
                .replace(/Audio Language/g, '[b]????????????[/b]')
                .replace(/Simplified Chinese/g, '????????????')
                .replace(/Traditional Chinese/g, '????????????')
                .replace(/English/g, '??????')
                .replace(/Russian/g, '??????')
                .replace(/German/g, '??????')
                .replace(/French/g, '??????')
                .replace(/Korean/g, '??????')
                .replace(/Japanese/g, '??????')
                .replace(/Italian/g, '????????????')
                .replace(/Turkish/g, '????????????')
                .replace(/Spanish - Latin America/g, '????????????-????????????')
                .replace(/Portuguese - Brazil/g, '????????????-??????')
                .replace(/Portuguese/g, '????????????')
                .replace(/Spanish - Spain/g, '????????????-?????????')
                .replace(/Thai/g, '??????')
                .replace(/Arabic/g, '????????????')
                .replace(/Danish/g, '?????????')
                .replace(/Dutch/g, '?????????')
                .replace(/Finnish/g, '?????????')
                .replace(/Norwegian/g, '?????????')
                .replace(/Polish/g, '?????????')
                .replace(/Swedish/g, '?????????')
                ;

    console.log('1337x: ' + lang);

    return lang;
}


function replaceLangAnchor(bb_lang) {
    if (!bb_lang) {
        changeStatus('????????????????????????????????????');
        return;
    }
    
    var descr = DESCR.val().replace('=+=LanguageAnchor=+=', bb_lang.trim());
    DESCR.val(descr);
    changeStatus('???????????????');
}

function requestUrl(urlSteam, urlFitgirl) {
    changeStatus('????????????FitGirl??????...');
    var bbstr;
    GM.xmlHttpRequest({
        method: "GET",
        url: urlFitgirl.val(),
        responseType: "document",
        onload: function(resp) {
            var parser = new DOMParser ();
            var ajaxDoc = parser.parseFromString(resp.responseText, "text/html");

            // ????????????
            bbstr = parseFitgirRepack(ajaxDoc)
            editboxPart2(bbstr)

            var lang_source = $("input[name='pfru_lang_source']:checked").val();
            console.log('?????????: ' + lang_source + ' ??????????????????');

            if (lang_source == '1337x') {
                var url1337x = get1337xUrl(ajaxDoc); // ??????1337x??????
                if (url1337x && url1337x != '') {
                    console.log('??????: ' + url1337x + ' ????????????');
                    changeStatus('?????????1337x??????????????????...');

                    GM.xmlHttpRequest({
                        method: 'GET',
                        url: url1337x,
                        onload(resp) {
                            var ajaxDoc = new DOMParser ().parseFromString(resp.responseText, "text/html");
                            var bb_lang = parse1337Language(ajaxDoc);
                            replaceLangAnchor(bb_lang);
                        },
                        onerror: function(resp) {
                            console.log(resp);
                            changeStatus('?????????????????????');
                        }
                    });
                } else {
                    changeStatus('????????????1337x??????...');
                }
            } else {
                changeStatus('?????????steam??????????????????...');
                GM.xmlHttpRequest({
                    method: "GET",
                    url: urlSteam.val(),
                    responseType: "document",
                    onload: function(resp){
                        var parser  = new DOMParser ();
                        var ajaxDoc = parser.parseFromString (resp.responseText, "text/html");
                        var bb_lang = parseSteamLanguage(ajaxDoc);
                        replaceLangAnchor(bb_lang);
                        // console.log (bbstr);
                    },
                    onerror: function(resp) {
                        console.log(resp);
                        changeStatus('?????????????????????');
                    }
                });
            }
        

           

            // ????????????
            var fitgirl_title = getFitgirlTitle(ajaxDoc); // ????????????
            var game_title = $("h1#top").text().slice(0,-4).trim();

            var name1 = '????????????: <span style="color: red">' + game_title + '</span><br>';
            var name2 = 'FitGirl ????????????: <span style="color: red">' + fitgirl_title + '</span>' + '<br>';

            var $name_e = $('#name').parent();
            $name_e.html(name1 + name2 + $name_e.html());

            $('#name').val((fitgirl_title.replace(game_title, '').trim() + ' -FitGirl').trim());


            // ????????????
            $("#categories").find("option[value='1']").attr("selected",true);
            // Portable
            $("#format").find("option[value='4']").attr("selected",true);
            // ??????
            $("#team").find("option[value='4']").attr("selected",true);
            // ?????????
            $("#vs").attr("checked",true);
            
            // console.log (bbstr);
        }
    });
    
}

(function() {
    'use strict';

    const PFRU_HTML = '<tr><td>Steam URL</td><td><input style="width: 450px;" id="steamurl" /></td></tr>'
                    + '<tr><td>FitGirl URL</td><td><input style="width: 450px;" id="fitgirlurl" /></td></tr>';

    var anchor = window.location.href.includes("uploadgame") ? $("#name") : $("input[name='torrentname']");
    anchor.parent().parent().after(PFRU_HTML);
    
    const steamurl = $("#steamurl");
    const fitgirlurl = $("#fitgirlurl");

    var lang_source_html = '<input type="radio" name="pfru_lang_source" value="1337x" checked />1337x'
    + '<input type="radio" name="pfru_lang_source" value="steam" />steam';

    fitgirlurl.after(
        // '<label>????????????:<a href="javascript:void(0);" title="???????????????????????????????????????????????????????????????" style="color: red">(?)</a></label><input type="checkbox" id="pfru_get_title" />'
        lang_source_html
        + ' <input type="button" id="pfru_fill_form" value="????????????????????????">'
        + ' <span id="pfru_status"></span>');

    $('#pfru_fill_form').click(function () { 
        requestUrl(steamurl, fitgirlurl); 
        $("#console").val("16"); 
    });

})();
