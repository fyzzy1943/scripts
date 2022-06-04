// ==UserScript==
// @name         Pter Fitgirl release Uploady
// @namespace    https://pterclub.com/forums.php?action=viewtopic&forumid=36&topicid=6829
// @version      1.2.0
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
    str = str.replace(//g, "\"");
    str = str.replace(//g, "\"");
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
    var output = '\n\n[font=sans-serif]\n\n\n' + info1_bb + '\n\n\n[b]' + info2_header_bb + '[/b]\n' +  info2_list_bb + '\n'

    if (dlc_bb != '') {
        output = output + '\n[b]Included DLCs:[/b]\n' + dlc_bb + '\n'
    }

    output = output + '[/font]';

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

    title = title + ' -FitGirl';
    return title;
}


function parseSteamLanguage($document){
    let table = $document.querySelector('table.game_language_options');

    if(!table) return;

    let languages = {};

    for (var r = 0; r < table.rows.length; r++) {
      for (var c = 0; c < table.rows[r].cells.length; c++) {
        if(table.rows[r].cells[c].textContent.trim() === '✔'){
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

function editboxPart1(str) {
    desc_field = "#descr";
    var hidetext = '[hide=安装步骤]\n [*]运行 \"Verify BIN files before installation.bat\" 进行MD5验证（可选）\n [*]运行 \"setup.exe\"安装游戏\n [*]开始游玩\n [*]游戏经过高压，需要一定时间才能解压完毕，请耐心等待。[/hide]';

    $(desc_field).val(hidetext + '\n\n' + str + $(desc_field).val());
}

function editboxPart2(str) {
    desc_field = "#descr";
    $(desc_field).val($(desc_field).val() + str);
}

function requestUrl(urlSteam, urlFitgirl) {
    var bbstr;
    GM.xmlHttpRequest({
        method: "GET",
        url: urlFitgirl.val(),
        responseType: "document",
        onload: function(resp){
            var parser  = new DOMParser ();
            var ajaxDoc  = parser.parseFromString(resp.responseText, "text/html");

            // 种子简介
            bbstr = parseFitgirRepack(ajaxDoc)
            editboxPart2(bbstr)

            // 获取标题
            if ($('#pfru_get_title').is(':checked')) {
                var torrent_title = getFitgirlTitle(ajaxDoc);
                $('#name').val(torrent_title);
            }

            // 游戏本体
            $("#categories").find("option[value='1']").attr("selected",true);
            // Portable
            $("#format").find("option[value='4']").attr("selected",true);
            // 欧美
            $("#team").find("option[value='4']").attr("selected",true);
            // 可信源
            $("#vs").attr("checked",true);

            // console.log (bbstr);
        }
    });
    GM.xmlHttpRequest({
        method: "GET",
        url: urlSteam.val(),
        responseType: "document",
        onload: function(resp){
            var parser  = new DOMParser ();
            var ajaxDoc = parser.parseFromString (resp.responseText, "text/html");
            bbstr = parseSteamLanguage(ajaxDoc)
            editboxPart1(bbstr)
            // console.log (bbstr);
        }
    });
}

(function() {
    'use strict';
    $("input[name='name']").parent().parent().after(
        "<tr><td>Steam URL</td><td><input style='width: 450px;' id='steamurl' /></td>/tr"+
        "<tr><td>Fitgirl URL</td><td><input style='width: 450px;' id='fitgirlurl' /></td></tr>"
    );
    const steamurl = $("#steamurl");
    const fitgirlurl = $("#fitgirlurl");
    fitgirlurl.after(
        '<label>替换标题:<a href="javascript:void(0);" title="勾选后获取原始标题，注意需要手动去除游戏名" style="color: red">(?)</a></label><input type="checkbox" id="pfru_get_title" />'
        + '<input type="button" id="fill_form" value="收集信息自动填写">');
    $('#fill_form').click(function () { requestUrl(steamurl, fitgirlurl); $("#console").val("16"); });

})();
