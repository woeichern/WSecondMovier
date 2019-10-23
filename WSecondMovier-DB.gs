var ss = SpreadsheetApp.getActive();

var sheetData   = ss.getSheetByName('data');
var sheetConfig = ss.getSheetByName('config');
var sheetUser   = ss.getSheetByName('user');

var numRowData      = sheetData.getLastRow();
var numRowConfig    = sheetConfig.getLastRow();
var numRowUser      = sheetUser.getLastRow();

var configTheaters  = getConfig(2);
var configYoutube   = getConfig(3);
var configLine      = getConfig(4);
var configRowIndex  = getConfig(5);

var API_KEY_GOOGLE              = configYoutube.API.Key;
var YOUTUBE_DATA_API_SEARCH_URL = configYoutube.API.Endpoint + API_KEY_GOOGLE;
var YOUTUBE_ENDPOINT            = configYoutube.Endpoint;
var LINE_CHANNEL_ACCESS_TOKEN   = configLine.ChannelAccessToken;
var LINE_HEADERS                = {'Content-Type': 'application/json; charset=UTF-8', 'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN,};


// For test
function test(){

    multicastTheaterNewMovie('hc1');

}

//  --------------------------------------  DB & Crawler Functions --------------------------------------

// To get movies' trailer data
function getMovieTrailerData(title){

    var response = UrlFetchApp.fetch(
		YOUTUBE_DATA_API_SEARCH_URL + "&q=" + title + "+預告",
		{ method: 'get' }
    );

    var responseJSON = JSON.parse(response.getContentText());

    var returnJSON = {};

    returnJSON['urlVideo']      = YOUTUBE_ENDPOINT + responseJSON.items[0].id.videoId;
    returnJSON['description']   = responseJSON.items[0]['snippet']['Description'];
    returnJSON['urlThumbnail']  = responseJSON.items[0]['snippet']['thumbnails']['high']['url'];

    return returnJSON;

}

// To get config
function getConfig(rowIndexConfig){

    return JSON.parse( sheetConfig.getRange(rowIndexConfig, 2).getValue() );

}

// To get time string
function getTimeString(){

    var d = new Date();

    var h = d.getHours();
    var m = d.getMinutes();

    var date = d.getDate();
    var month = d.getMonth() + 1;

    h       = h < 10 ? "0" + h : h;
    m       = m < 10 ? "0" + m : m;
    date    = date < 10 ? "0" + date : date;
    month   = month < 10 ? "0" + month : month;


    var timeString = month + "-" + date + " " + h + ":" + m;

    return timeString;

}

// To parse request response content to xml object
function xmlPreprocess(xml){

    return xml.replace(/<hr width=90%>/g, '')
            .replace(/ async /g, ' async="async" ')
            .replace(/http:\/\/www.atmovies.com.tw\/showtime\/t03521\/a35\/\">/g, 'http:// www.atmovies.com.tw/showtime/t03521/a35/"/>')
            .replace(/<img src=\"\/images\/logo300.gif" height=50 style=\"margin-right:40px;margin-left: -200px;\">/g, '<img src="/images/logo300.gif" height="50" style="margin-right:40px;margin-left: -200px;"/>')
            .replace(/<img src=\"\/images\/logo100.png\">/g, '<img src="/images/logo100.png"/>')
            .replace(/<font color=#cc0000>/g, '<font color="#cc0000">')
            .replace(/<HR>/g, '')
            .replace(/<img src=\"\/images\/search.png\" border=0 onclick=\"treemenu\(\'searchID78kldtfbnsfo\'\);\">/g, '<img src="/images/search.png" border="0" onclick="treemenu(' + "'searchID78kldtfbnsfo'" + ');"/>')
            .replace('<a href="http:// bbs.atmovies.com.tw/bbs/bbs.cfm?action=listsa&c=104&sa=t03521&st=t"', '<a')
            .replace('<font color=cc3366>戲院討論區</font></a>', '<font color=cc3366>戲院討論區</font></a></p>')
            .replace('<BR clear="both">', '<BR clear="both"/>')
            .replace('<input type=hidden name=fr value="@movies-www">', '<input type="hidden" name="fr" value="@movies-www"/>')
            .replace('<input type=hidden name=enc value="UTF-8">', '<input type="hidden" name="enc" value="UTF-8"/>')
            .replace('<input type="hidden" name="type" value="all">', '<input type="hidden" name="type" value="all"/>')
            .replace('<input type="text" name="search_term" id="search-field" autocomplete="off" class="form-input" placeholder=" 搜尋電影&amp;明星&amp;DVD ">', '<input type="text" name="search_term" id="search-field" autocomplete="off" class="form-input" placeholder=" 搜尋電影&amp;明星&amp;DVD "/>')
            .replace('<input type="submit" name="sa" value="Search" class="form-submit">', '<input type="submit" name="sa" value="Search" class="form-submit"/>')
            .replace('<form id="searchform" name=all_search action="http:// search.atmovies.com.tw/search/" method=post onsubmit="return checkinput();"', '<form id="searchform" name="all_search" action="http:// search.atmovies.com.tw/search/" method="post" onsubmit="return checkinput();"')
            .replace('<li>電話: (03)524-8285 <li>網站: <a href="https:// zh-tw.facebook.com/pages/%E6%96%B0%E7%AB%B9%E6%96%B0%E5%BE%A9%E7%8F%8D%E6%88%B2%E9%99%A2/268130616548249" target="_blank">zh-tw.facebook.com</a>', '</li><li>電話: (03)524-8285 </li><li>網站: <a href="https:// zh-tw.facebook.com/pages/%E6%96%B0%E7%AB%B9%E6%96%B0%E5%BE%A9%E7%8F%8D%E6%88%B2%E9%99%A2/268130616548249" target="_blank">zh-tw.facebook.com</a></li>')
            .replace("<a href='http:// app2.atmovies.com.tw/service/service.cfm?action=contact&subject=%E9%9B%BB%E5%BD%B1%E7%9C%8B%E6%9D%BF%E6%9B%B4%E6%AD%A3%20%E4%B9%8B%E3%80%90%E6%96%B0%E5%BE%A9%E7%8F%8D%E6%88%B2%E9%99%A2%E3%80%91%2D%2Dt03521'>聯絡我們</a>", "")
            .replace(/<hr width=90%>/g, '  <hr width="90%">')
            .replace(/<font color=cc3366>/g, '<font color="cc3366">')
            .replace(/align=center/g, 'align="center"')
            .replace(/class=SelectTitle/g, 'class="SelectTitle"')
            .replace(/ width=140 height=200>/g, ' width="140" height="200"/>')
            .replace(/ hspace=2 vspace=0 align=absmiddle>/g, ' hspace="2" vspace="0" align="absmiddle"/> ')
            .replace(/ hspace=0 align=absmiddle/g, ' hspace="2" align="absmiddle"')
            .replace(/ method=post /g, ' method="post" ')
            .replace(/ target=_blank>/g, ' target="_blank">');

}

// To set theater JSON
function setTheaterJSON(theaterKey, theaterDataInput, trailerData){

    var configTheater = configTheaters[theaterKey];

    var theaterName         = configTheater.name;
    var theaterAddress      = configTheater.address;
    var theaterTel          = configTheater.tel;
    var theaterLatitude     = configTheater.location.latitude;
    var theaterLongitude    = configTheater.location.longitude

    var commonColumnJSON = {
        title: theaterName,
        text: "地址：" + theaterAddress + "\n電話：" + theaterTel + "\n"
    };

    var theaterJSON = {
        movieList: theaterDataInput.movies.list.sort(),
        infoColumnJSON : {
            title: commonColumnJSON.title,
            text: commonColumnJSON.text,
            actions: [
                {
                    type: "message",
                    label: "查詢時刻表",
                    text: "showtimes;" + theaterKey
                },
                {
                    type: "message",
                    label: "戲院位置",
                    text: "location;" + theaterKey
                },
                {
                    type: "message",
                    label: "放映電影",
                    text: "movies;" + theaterKey
                }
            ]
        },
        unsubscriptColumnJSON : {
            title: commonColumnJSON.title,
            text: commonColumnJSON.text,
            actions: [
                {
                    type: "message",
                    label: "取消訂閱",
                    text: "unsubscript;"+theaterKey
                }
            ]
        },
        subscriptColumnJSON : {
            title: commonColumnJSON.title,
            text: commonColumnJSON.text,
            actions: [
                {
                    type: "message",
                    label: "訂閱",
                    text: "subscript;"+theaterKey
                }
            ]
        },
        showtimesJSON : [],
        moviesJSON : [
            {
                type:"text",
                text: "【" + theaterName + "】\n-----今日放映電影-----"
            },
            {
                type: "template",
                altText: "今日放映電影1",
                template: {
                    type: "carousel",
                    columns: []
                }
            },
            {
                type: "template",
                altText: "今日放映電影2",
                template: {
                    type: "carousel",
                    columns: []
                }
            }
        ],
        locationJSON:[
            {
                type: "location",
                title:    theaterName,
                address:  theaterAddress,
                latitude: theaterLatitude,
                longitude:theaterLongitude
            }
        ]
    };

    var showtimesMessageList = [];

    for(var auditorim in theaterDataInput['auditorims']){

        messageItem = {};
        messageItem['type'] = 'text';
        messageItem['text'] = "【" + theaterName + "】\n";
        messageItem['text'] += "-----" + auditorim + "-----\n";

        for(var index in theaterDataInput['auditorims'][auditorim]){

            movieTitle = theaterDataInput['auditorims'][auditorim][index]['title'];
            movieTime = theaterDataInput['auditorims'][auditorim][index]['time'];

            messageItem['text'] += movieTime + "@" + movieTitle + "\n";

        }

        showtimesMessageList.push(messageItem);

    }

    if(showtimesMessageList.length > 5){

        var messageListNew = [];

        for(var i = 0; i < showtimesMessageList.length; i+=2){

            var itemMessageListNew = {};

            itemMessageListNew['type'] = "text";

            if(i+1 < showtimesMessageList.length-1){

                itemMessageListNew['text'] = showtimesMessageList[i]['text']  + "\n\n" + showtimesMessageList[i+1]['text'];

            } else {

                itemMessageListNew['text'] = showtimesMessageList[i]['text'];

            }

            messageListNew.push(itemMessageListNew);

        }

        showtimesMessageList = messageListNew;

    }

    theaterJSON.showtimesJSON = showtimesMessageList;

    for(var i in theaterDataInput.movies.list){

        var movieTitle = theaterDataInput.movies.list[i];

        var movieTrailerData = trailerData[movieTitle];

        var urlTrailer          = movieTrailerData['URL'];
        var thumbnailsTrailer   = movieTrailerData['Thumbnails'];
        var descriptionTrailer  = movieTrailerData['Description'];

        var column = {
                title: movieTitle,
                thumbnailImageUrl: thumbnailsTrailer,
                text: descriptionTrailer.substr(0, 60),
                actions: [
                    {
                        type: "uri",
                        label: "Youtube連結",
                        uri: urlTrailer
                    }
                ]

        };

        theaterJSON.moviesJSON[1 + i%2].template.columns.push(column);

    }

    sheetData.getRange(configRowIndex[theaterKey], 2).setValue( JSON.stringify(theaterJSON) );

}

// To set theaters list JSON
function setTheaterListJSON(){

    var theaterListJSON = [
        {
            type: "template",
            altText: "北部二輪電影院",
            template: {
                type: "carousel",
                columns: []
            }
        },
        {
            type: "template",
            altText: "中南部二輪電影院",
            template: {
                type: "carousel",
                columns: []
            }
        },
        {
            type: "template",
            altText: "中南部二輪電影院",
            template: {
                type: "carousel",
                columns: []
            }
        }

    ];

    for(var theaterKey in configTheaters){

        var configTheater = configTheaters[theaterKey];
        var theaterJSON = getJSON(theaterKey);
        var theaterZone = configTheater.zone;

        theaterListJSON[theaterZone-1].template.columns.push(theaterJSON.infoColumnJSON);

    }

    sheetData.getRange(configRowIndex['theaterListJSON'], 2).setValue( JSON.stringify(theaterListJSON) );

}

// Set All JSON
function setJSON() {

    var theaterData = {};

    setTheaterListJSON();

    // Get each theater data
    for(var theaterKey in configTheaters){

        var configTheater = configTheaters[theaterKey];

        theaterData[theaterKey] = {
            movies: {
                list: [],
                items:[]
            },
            auditorims: {}
        };

        var fetchURL = configTheater['atmoviesURL'];

        var responseText = UrlFetchApp.fetch(fetchURL).getContentText('UTF-8');

        // Only get showtime table dom
        var start = responseText.search('<ul id="theaterShowtimeTable">');
        var end = responseText.search('</div><!-- theaterShowtimeBlock showtime_block end-->');

        responseText = "<root>" + responseText.substring(start, end) + "</root>";

        xml = xmlPreprocess(responseText);

        var document = XmlService.parse(xml);
        var root = document.getRootElement();

        // Get movie list ul dom
        var listMovie = root.getChildren('ul');

        // For loop to parse all movie info
        for(var i in listMovie){

            // If there are only one auditorim of current theater, give it a default auditorim named "主廳"
            var auditorimList = configTheater.auditorims.length > 0 ? configTheater.auditorims : ["主廳"];

            for(var k in auditorimList){

                var auditorim = auditorimList[k];

                theaterData[theaterKey]['auditorims'][auditorim] = [];

            }

            // Movie item object template
            var movieListItem = {};

            // Pick li dom
            var li = listMovie[i].getChildren('li');

            // If there are no child dom, do next one
            if(li.length == 0) continue;

            // Get title of current movie
            movieListItem['title'] = li[0].getChildren('a')[0].getText();

            theaterData[theaterKey]['movies']['list'].push(movieListItem['title']);

            var ulInfoMovie = li[1].getChildren('ul')

            // Get lenght of current movie
            movieListItem['length'] = ulInfoMovie[0].getChildren('li')[1].getText();

            var liInfoMovie = ulInfoMovie[1].getChildren('li');

            var parseIndexFrom = 1;

            // Get auditorim of current moive

            if(liInfoMovie[0].getText().search("廳") > -1){

                movieListItem['auditorim']  = liInfoMovie[0].getText();

            } else if(liInfoMovie[0].getText().search("語版") > -1){

                parseIndexFrom = 2;

                movieListItem['auditorim']  = liInfoMovie[1].getText();
                movieListItem['title'] += "(" + liInfoMovie[0].getText() + ")";

            } else {

                var parseIndexFrom = 0;

                movieListItem['auditorim']  = "主廳";

            }

            // Get time list of current moive
            movieListItem['time'] = [];

            for(var i = parseIndexFrom; i < liInfoMovie.length - 1; i++){

                movieListItem['time'].push(liInfoMovie[i].getText());

            }

            theaterData[theaterKey]['movies']['items'].push(movieListItem);

        }

        // Sort movie items by play time
        theaterData[theaterKey]['movies']['items'].sort(function(a, b){

            return a.time < b.time ? -1 : 1;

        });

        // Fetch movie info and rearrange by auditorim
        for(var i in theaterData[theaterKey]['movies']['items']){

            var auditorim = theaterData[theaterKey]['movies']['items'][i]['auditorim'];

            for(var k in theaterData[theaterKey]['movies']['items'][i]['time']){

                var item = {};

                item['title']   = theaterData[theaterKey]['movies']['items'][i]['title'];
                item['time']    = theaterData[theaterKey]['movies']['items'][i]['time'][k];

                theaterData[theaterKey]['auditorims'][auditorim].push(item);

            }

        }

        // Sort movie list
        theaterData[theaterKey]['movies']['list'].sort();

        // Sort showtime of each auditorim by play time
        for(var auditorim in theaterData[theaterKey]['auditorims']){

            theaterData[theaterKey]['auditorims'][auditorim].sort(function(a, b){

                return a.time < b.time ? -1 : 1;

            });

        }

    }

    var movieList = [];

    //Get movie list
    for(var theaterKey in configTheaters){

        var configTheater = configTheaters[theaterKey];

        var dataTheater = theaterData[theaterKey];

        for(var i in dataTheater.movies.list){

            if( movieList.indexOf(dataTheater.movies.list[i]) < 0 ){

                movieList.push(dataTheater.movies.list[i] );

            }
        }

    }

    var trailerData = {};

    //Get movie info data
    for(var i in movieList){

        var movieTitle = movieList[i];

        var trailerDataJSON = getMovieTrailerData(movieTitle);

        trailerData[movieTitle] = {};

        trailerData[movieTitle]['URL']         = trailerDataJSON['urlVideo'];
        trailerData[movieTitle]['Thumbnails']  = trailerDataJSON['urlThumbnail'];
        trailerData[movieTitle]['Description'] = trailerDataJSON['description'];

    }

    //trailerData = {"名偵探柯南：紺青之拳":{"Trailer":{"URL":"https://www.youtube.com/watch?v=pyaJVNd3Ons","Thumbnails":"https://i.ytimg.com/vi/pyaJVNd3Ons/hqdefault.jpg","Description":"改編自日本漫畫家青山剛昌推理漫畫系列，名偵探柯南於平成時代所上映的最後一部劇場版【名偵探柯南23：紺青之拳】Detective Conan 23:The Fist of..."}},"獅子王":{"Trailer":{"URL":"https://www.youtube.com/watch?v=MQuUkET0lQg","Thumbnails":"https://i.ytimg.com/vi/MQuUkET0lQg/hqdefault.jpg","Description":"1994 年迪士尼經典動畫長片《獅子王》真人版重現!! 【與森林共舞】億萬導演新作【獅子王】The Lion King 完整電影情報→ https://www.truemovie.com/2019moviedata..."}},"玩具總動員4":{"Trailer":{"URL":"https://www.youtube.com/watch?v=RA-11WlGGkE","Thumbnails":"https://i.ytimg.com/vi/RA-11WlGGkE/hqdefault.jpg","Description":"迪士尼影業粉絲頁: https:/www.facebook.com/disneymoviesTaiwan 迪士尼影業官方YouTube 頻道: https://www.youtube.com/user/disneymoviestw."}},"蜘蛛人：離家日":{"Trailer":{"URL":"https://www.youtube.com/watch?v=6ytcJdQpvVE","Thumbnails":"https://i.ytimg.com/vi/6ytcJdQpvVE/hqdefault.jpg","Description":"嚴重警告⚠️⚠️ ⚠️⚠️ ⚠️ ⚠️ 【蜘蛛人：離家日】最新預告雷很大沒看過《復仇者聯盟：終局之戰》千萬別看！ 真的先不要！彼..."}},"電流大戰":{"Trailer":{"URL":"https://www.youtube.com/watch?v=KF8vFnhEHzE","Thumbnails":"https://i.ytimg.com/vi/KF8vFnhEHzE/hqdefault.jpg","Description":"官網：http://theatrical.catchplay.com/Movies/thecurrentwar 臉書：https://www.facebook.com/catchplay/ 預售 ..."}},"從前，有個好萊塢":{"Trailer":{"URL":"https://www.youtube.com/watch?v=AEjLxmmYBGc","Thumbnails":"https://i.ytimg.com/vi/AEjLxmmYBGc/hqdefault.jpg","Description":"金獎名導\"昆丁塔倫提諾\"從影第9部作品! 李奧納多狄卡皮歐、瑪格羅比繼【華爾街之狼】後再度合作! 布萊德彼特、達柯塔芬妮、艾爾帕西諾、艾米里..."}},"懸案判決":{"Trailer":{"URL":"https://www.youtube.com/watch?v=t6Sxac9LTqw","Thumbnails":"https://i.ytimg.com/vi/t6Sxac9LTqw/hqdefault.jpg","Description":"8.9 找出真相【法國知名導演自編自導首部劇情長片】 【改編真實刑事懸案口碑延燒法國票房破億法庭攻防之作】 〈坎城影帝〉#奧利維古賀梅..."}},"我出去透透氣":{"Trailer":{"URL":"https://www.youtube.com/watch?v=Pv_VGTO3RXU","Thumbnails":"https://i.ytimg.com/vi/Pv_VGTO3RXU/hqdefault.jpg","Description":"我出去透透氣】電影介紹： http://garageplay.tw/1697 上映日期：2019.08.02 ☆ 《#何處是我家》奧斯卡金像獎得主卡洛琳林克最新作品☆ 超過350萬人淚眼..."}},"痛苦與榮耀":{"Trailer":{"URL":"https://www.youtube.com/watch?v=wYJzE-Syezg","Thumbnails":"https://i.ytimg.com/vi/wYJzE-Syezg/hqdefault.jpg","Description":"坎城影展最佳導演\"阿莫多瓦\"最新力作，繼【慾望法則】、【壞教慾】後橫跨32年時間完成「導演三部曲」最終章! \"安東尼奧班德拉斯\"憑本片榮登坎城..."}},"乘浪之約":{"Trailer":{"URL":"https://www.youtube.com/watch?v=fz9bHT6Ci9c","Thumbnails":"https://i.ytimg.com/vi/fz9bHT6Ci9c/hqdefault.jpg","Description":"今年最沁涼浪漫的夏日戀曲日本動畫鬼才湯淺政明最新力作 繼《你的名字》後最浪漫療癒的動畫電影 故事描述為了去大學念書..."}},"使徒行者2：諜影行動":{"Trailer":{"URL":"https://www.youtube.com/watch?v=bF4gEHaX-Ew","Thumbnails":"https://i.ytimg.com/vi/bF4gEHaX-Ew/hqdefault.jpg","Description":"三大影帝再度合作聯手調查潛伏臥底再次呈現別樹一格的「使徒」精神堅定的守護正義而不惜付出一切8月8日隆重獻映  三⼤影帝再度合作..."}},"在黑暗中說的鬼故事":{"Trailer":{"URL":"https://www.youtube.com/watch?v=18-YA7TtfR0","Thumbnails":"https://i.ytimg.com/vi/18-YA7TtfR0/hqdefault.jpg","Description":"羊男的迷宮、水底情深金獎大導演\"吉勒摩戴托羅\"監製，驗屍官好評導演最新力作【在黑暗中說的鬼故事】Scary Stories to Tell in the Dark 完整電影情報→..."}},"殺手寓言":{"Trailer":{"URL":"https://www.youtube.com/watch?v=eQZ0u4yed7Y","Thumbnails":"https://i.ytimg.com/vi/eQZ0u4yed7Y/hqdefault.jpg","Description":"加入官方IG：https://bit.ly/2Oy78Sf ☆ 加入官方FB：https://bit.ly/2pNZJ6H = ☆ 暢銷漫畫改編，榮登日本首週新片票房冠軍，勇破百萬觀影人次！ ☆..."}},"絕世名伶":{"Trailer":{"URL":"https://www.youtube.com/watch?v=aRiVUkjyXkE","Thumbnails":"https://i.ytimg.com/vi/aRiVUkjyXkE/hqdefault.jpg","Description":"末代沙皇真實故事，夏宮、馬林斯基劇院、莫斯科大劇院實景拍攝 世界三大芭蕾舞團的馬林斯基劇院芭蕾舞團備受爭議的芭蕾名伶 世界..."}},"阿拉丁":{"Trailer":{"URL":"https://www.youtube.com/watch?v=1Cj4z4PiUCc","Thumbnails":"https://i.ytimg.com/vi/1Cj4z4PiUCc/hqdefault.jpg","Description":"迪士尼影業粉絲頁: https:/www.facebook.com/disneymoviesTaiwan 迪士尼影業官方YouTube 頻道: https://www.youtube.com/user/disneymoviestw."}},"深夜加油站遇見抓狂衰事":{"Trailer":{"URL":"https://www.youtube.com/watch?v=QM0w2iXn5jg","Thumbnails":"https://i.ytimg.com/vi/QM0w2iXn5jg/hqdefault.jpg","Description":"新銳華裔導演作品，荒誕幽默笑點獲得全場觀眾熱烈反應☆ 人氣新秀演員蘇琪沃特豪斯、岑勇康Harry Shum Jr. 不計形象，放膽演出☆ 角色有趣，劇..."}},"緝魔":{"Trailer":{"URL":"https://www.youtube.com/watch?v=Fn7jYM7pNfo","Thumbnails":"https://i.ytimg.com/vi/Fn7jYM7pNfo/hqdefault.jpg","Description":"2019年最讓人不寒而慄的超限制級驚悚台灣電影☆ 集合金獎卡司莊凱勛、邵雨薇、傅孟柏演技爆發，打造血腥懸疑之作☆ 整形美人慘遭斷頭棄屍..."}},"靈異乍現":{"Trailer":{"URL":"https://www.youtube.com/watch?v=N1osOk5ONWg","Thumbnails":"https://i.ytimg.com/vi/N1osOk5ONWg/hqdefault.jpg","Description":"超人降臨or 惡魔轉生？【星際異攻隊】億萬導演\"詹姆斯岡恩\"與團隊製作【靈異乍現】Brightburn 完整電影情報→ ..."}},"灼人秘密":{"Trailer":{"URL":"https://www.youtube.com/watch?v=IRerp4-S9VI","Thumbnails":"https://i.ytimg.com/vi/IRerp4-S9VI/hqdefault.jpg","Description":"你準備好了嗎揭開演藝圈最暗黑的秘密  坎城影展「一種注目」競賽單元、台北電影節開幕片  《再見瓦城》導演趙德胤顛覆華語片驚悚..."}},"懸案密碼 第64號":{"Trailer":{"URL":"https://www.youtube.com/watch?v=Wfx_IRCRb8U","Thumbnails":"https://i.ytimg.com/vi/Wfx_IRCRb8U/hqdefault.jpg","Description":"【龍紋身的女孩】製作團隊重金打造，全球銷售突破1500萬冊暢銷推理鉅作改編【懸案密碼4:第64號病歷】The Purity of Vengeance 完整電影情報→ https://www.tr..."}},"炫目之光":{"Trailer":{"URL":"https://www.youtube.com/watch?v=Bmg4mu4GJSo","Thumbnails":"https://i.ytimg.com/vi/Bmg4mu4GJSo/hqdefault.jpg","Description":"有沒有一首歌、一位偶像深深的改變了你？ 【炫目之光】一個被音樂啟發的真實故事✨ . 改編自英國作家薩費茲曼佐廣受好評的回憶錄，他在「人生..."}},"電影哆啦A夢：大雄的月球探測記":{"Trailer":{"URL":"https://www.youtube.com/watch?v=ei3EMgcq00A","Thumbnails":"https://i.ytimg.com/vi/ei3EMgcq00A/hqdefault.jpg","Description":"電影哆啦A夢：大雄的月球探測記】電影介紹： http://garageplay.tw/1614 Facebook粉絲頁：https://www.facebook.com/garageplay.tw 上映日期: 2019.07.26 信賴的 ..."}},"一首搖滾上月球":{"Trailer":{"URL":"https://www.youtube.com/watch?v=QnriSghHdyI","Thumbnails":"https://i.ytimg.com/vi/QnriSghHdyI/hqdefault.jpg","Description":"電影粉絲團：https://www.facebook.com/OTurnFilms 電影【一首搖滾上月球】X 熱血老爸樂團【睏熊霸】，2013年最真性情的搖滾樂章！ 監製：【翻滾吧阿信】林..."}},"錢不夠用２":{"Trailer":{"URL":"https://www.youtube.com/watch?v=sBUOChL-k24","Thumbnails":"https://i.ytimg.com/vi/sBUOChL-k24/hqdefault.jpg","Description":"何時你會考慮自己往生的價值？等老了？病了？還是到了生命交叉口、你尚有能力決定「自己生與死之價值」的時刻？這問題很玄？的確是大哉問！..."}},"王者天下":{"Trailer":{"URL":"https://www.youtube.com/watch?v=RQLKb5APH9g","Thumbnails":"https://i.ytimg.com/vi/RQLKb5APH9g/hqdefault.jpg","Description":"日本年度最大史詩製作，票房飆破50 億！ □ 山崎賢人、橋本環奈、吉澤亮、長澤雅美、大澤隆夫□ 絕不可能寫實化的作品，終於登上大銀幕！..."}},"復仇者聯盟4：終局之戰":{"Trailer":{"URL":"https://www.youtube.com/watch?v=ZrB7EdfPBJU","Thumbnails":"https://i.ytimg.com/vi/ZrB7EdfPBJU/hqdefault.jpg","Description":"不計一切代價，《復仇者聯盟：終局之戰》全新預告，電影4月24日(三)搶先上映。"}}};

    for(var theaterKey in configTheaters){

        var theaterJSON = getJSON(theaterKey);

        var movieListOld = theaterJSON.movieList.sort().join(',');
        var movieListNew = theaterData[theaterKey].movies.list.sort().join(',');

        if(movieListOld !== movieListNew){

            addToPushTheaters(theaterKey);

        }

        setTheaterJSON(theaterKey, theaterData[theaterKey], trailerData);

    }

}

// To add a theaterKey to toPushTheaters array
function removedToPushTheaters(theaterKey){

    var arrayToPushTheaters = JSON.parse( sheetData.getRange(configRowIndex['toPushTheaters'], 2).getValue() );

    if(arrayToPushTheaters.indexOf(theaterKey) > -1){

        arrayToPushTheaters = arrayToPushTheaters.filter(function(value, index, subscriptionList){

            return value !== theaterKey;

        });

        arrayToPushTheaters.sort();

    }

    sheetData.getRange(configRowIndex['toPushTheaters'], 2).setValue( JSON.stringify(arrayToPushTheaters) );

}

// To add a theaterKey to toPushTheaters array
function addToPushTheaters(theaterKey){

    var arrayToPushTheaters = JSON.parse( sheetData.getRange(configRowIndex['toPushTheaters'], 2).getValue() );

    if(arrayToPushTheaters.indexOf(theaterKey) < 0){

        arrayToPushTheaters.push(theaterKey);
        arrayToPushTheaters.sort();

        sheetData.getRange(configRowIndex['toPushTheaters'], 2).setValue( JSON.stringify(arrayToPushTheaters) );

    }

}

// To get toPushTheaters array
function getToPushTheaters(){

    return JSON.parse( sheetData.getRange(configRowIndex['toPushTheaters'], 2).getValue() );

}

// To add a uid
function addUser(uid){

    // Check if given uid exist in user sheet

    var ifExist = getUserRowIndex(uid) > 0 ? true : false;

    if(!ifExist){

        sheetUser.appendRow([uid, '{"subscriptions":[]}']);

    }

}

// To get row index of given uid in user sheet
function getUserRowIndex(uid){

    var rowIndexUser = 0;

    for(var i = 2; i < numRowUser+1; i++){

        var v = sheetUser.getRange(i, 1).getValue();

        if(v === uid){

            rowIndexUser = i;

            break;

        }

    }

    return rowIndexUser;

}

// To clear blank row in user sheet
function clearUserSheet(){

    for(var i = numRowUser; i > 2; i--){

        var v = sheetUser.getRange(i, 1).getValue();

        if(v == ""){

            deleteRow(i);

        }

    }
}

// To add the theaterKey to the subscription array of given uid
function addSubscription(uid, theaterKey){

    var subscriptionList = getUserSubscriptions(uid);

    var rowIndexUser = getUserRowIndex(uid);

    if( subscriptionList.indexOf(theaterKey) < 0 ){

        subscriptionList.push(theaterKey);

        sheetUser.getRange(rowIndexUser, 2).setValue( JSON.stringify(subscriptionList) );

    }

}

// To remove the theaterKey from the subscription array of given uid
function removeSubscription(uid, theaterKey){

    var subscriptionList = getUserSubscriptions(uid);

    if( subscriptionList.indexOf(theaterKey) >= -1 ){

        subscriptionList = subscriptionList.filter(function(value, index, subscriptionList){

            return value !== theaterKey;

        });

        var rowIndexUser = getUserRowIndex(uid);

        sheetUser.getRange(rowIndexUser, 2).setValue( JSON.stringify(subscriptionList) );

    }

}

// To get the subscriptions of given uid
function getUserSubscriptions(uid){

    var subscriptionList = [];

    var rowIndexUser = getUserRowIndex(uid);

    if(rowIndexUser > 0){

        subscriptionList = JSON.parse( sheetUser.getRange(rowIndexUser, 2).getValue() );

    }

    return subscriptionList;

}

// To get user list who subscript the theater of given theaterKey
function getSubscriptUserList(theaterKey){

    var userList = [];

    for(var i = 2; i < numRowUser+1; i++){

        var uid = sheetUser.getRange(i, 1).getValue();
        var subscriptionsArray = JSON.parse(sheetUser.getRange(i, 2).getValue());

        if(subscriptionsArray.indexOf(theaterKey) > -1){

            userList.push(uid);

        }

    }

    return userList;

}

// To get theater data
function getJSON(key){

    return JSON.parse( sheetData.getRange(configRowIndex[key], 2).getValue() );

}
//  -------------------------------------- LINE Bot Webhook Functions --------------------------------------

// Webhook main function
function doPost(e) {

    var eventObject = JSON.parse(e.postData.contents).events[0];

    var replyToken  = eventObject.replyToken;
    var uid         = eventObject.source.userId;
    var type        = eventObject.type;

    addUser(uid);

    switch(type){

        case 'message':

            var arguments = eventObject.message.text.split(';');

            var command = arguments[0];

            switch(command){

                case 'subscriptions':

                    // Reply user subscriptions
                    replySubscriptions(replyToken, uid);

                    break;

                case 'unsubscript':

                    // Unsubscript given theater of given uid

                    var theaterKey = arguments[1];
                    var theaterName = configTheaters[theaterKey].name;

                    removeSubscription(uid, theaterKey);

                    replySimpleMessage(replyToken, "已取消訂閱 " + theaterName);

                    break;

                case 'subscript':

                    // Subscript given theater of given uid

                    var theaterKey = arguments[1];
                    var theaterName = configTheaters[theaterKey].name;

                    addSubscription(uid, theaterKey);

                    replySimpleMessage(replyToken, "已訂閱 " + theaterName);

                    break;

                case 'movies':

                    var theaterKey = arguments[1];

                    var theaterJSON = getJSON(theaterKey);

                    replyMessage(replyToken, theaterJSON.moviesJSON);

                    break;

                case 'location':

                    var theaterKey = arguments[1];

                    var theaterJSON = getJSON(theaterKey);

                    replyMessage(replyToken, theaterJSON.locationJSON);

                    break;

                case 'showtimes':

                    var theaterKey = arguments[1];

                    var theaterJSON = getJSON(theaterKey);

                    replyMessage(replyToken, theaterJSON.showtimesJSON);

                    break;

                case 'theaters':
                default:

                    var theaterListJSON = getJSON('theaterListJSON');

                    replyMessage(replyToken, theaterListJSON);

                    break;

            }

            break;

        case 'unfollow':

            break;

        case 'follow':

            addUser(uid);

            break;

        default:

            var theaterListJSON = getJSON('theaterListJSON');

            replyMessage(replyToken, theaterListJSON);

            break;

    }

}

// To reply simple text message
function replySimpleMessage(replyToken, message){

    replyMessage(replyToken, [{type:"text",text:message}]);

}

// To reply message
function replyMessage(replyToken, messageList){

    UrlFetchApp.fetch(
		configLine.API.Reply,
		{
			headers: LINE_HEADERS,
			method: 'post',
			payload: JSON.stringify({
				replyToken: replyToken,
				messages: messageList
			})
		}
    );

}

// To reply the subscriptions list of given uid
function replySubscriptions(replyToken, uid){

    var subscriptions = getUserSubscriptions(uid);

    var messageList = [
        {
            type: "template",
            altText: "北部二輪電影院",
            template: {
                type: "carousel",
                columns: []
            }
        },
        {
            type: "template",
            altText: "中南部二輪電影院",
            template: {
                type: "carousel",
                columns: []
            }
        },
        {
            type: "template",
            altText: "中南部二輪電影院",
            template: {
                type: "carousel",
                columns: []
            }
        }
    ];

    for(var theaterKey in configTheaters){

        var theaterJSON = getJSON(theaterKey);

        var theaterZone     = configTheaters[theaterKey].zone;

        var column = subscriptions.indexOf(theaterKey) > -1 ? theaterJSON.unsubscriptColumnJSON : theaterJSON.subscriptColumnJSON;

        messageList[theaterZone-1].template.columns.push(column);

    }

    replyMessage(replyToken, messageList);

}

// To multicast
function multicastTheaterNewMovie(theaterKey){

    var userList = getSubscriptUserList(theaterKey);

    var configTheater = configTheaters[theaterKey];

    var theaterJSON = getJSON(theaterKey);

    var toPushTheaterList = getToPushTheaters();

    if( toPushTheaterList.indexOf(theaterKey) > -1 && userList.length > 0){

        var movieList = theaterJSON.movieList;

        var theaterName = configTheater.name;

        var messageList = [
            {
                type: "text",
                text: "【" + theaterName + "】\n放映電影更新通知\n-----今日放映電影-----\n" + movieList.join('\n')
            }
        ];

        multicastMessage(userList, messageList);

    }

}

//To multicast messages
function multicastMessage(userList, messageList){

    UrlFetchApp.fetch(
		configLine.API.Multicast,
		{
			headers: LINE_HEADERS,
			method: 'post',
			payload: JSON.stringify({
				to: userList,
                messages: messageList,
                notificationDisabled: true
			})
		}
    );

}

function dailyWork(){

    setJSON();

    for(var theaterKey in configTheaters){

        multicastTheaterNewMovie(theaterKey);
        removedToPushTheaters(theaterKey)

    }

}
