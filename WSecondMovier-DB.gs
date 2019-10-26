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

var configRowIndex = {};

for(var i = numRowData; i >= 2; i-- ){

    var key = sheetData.getRange(i, 1).getValue()

    configRowIndex[key] = i;

}

var API_KEY_GOOGLE              = configYoutube.API.Key;
var YOUTUBE_DATA_API_SEARCH_URL = configYoutube.API.Endpoint + API_KEY_GOOGLE;
var YOUTUBE_ENDPOINT            = configYoutube.Endpoint;
var LINE_CHANNEL_ACCESS_TOKEN   = configLine.ChannelAccessToken;
var LINE_HEADERS                = {'Content-Type': 'application/json; charset=UTF-8', 'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN,};

//  -------------------------------------- Others Functions --------------------------------------

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

//  -------------------------------------- Crawler Functions --------------------------------------

// To parse request response content to xml object
function xmlPreprocess(xmlInput){

    //Remove img tag
    var xml = xmlInput;

    var beginImg = xml.search("<img");

    while(beginImg > -1){

        search1 = xml.substr(beginImg).search(">");
        search2 = xml.substr(beginImg).search("/>");

        var lengthImg = search1+1;

        if(search1 === search2 +1){

            lengthImg = search2+2;

        }

        Logger.log("beginImg=" + beginImg + ", lengthImg=" + lengthImg + ", " + "search1="+search1 +", "+"search2="+search2);

        xml = xml.replace(xml.substr(beginImg).substr(0, lengthImg), "");

        //Logger.log(xml);

        beginImg = xml.search("<img");

    }

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
            .replace(/<img*>/g, '<img/>')
            .replace(/ target=_blank>/g, ' target="_blank">');

}

//  -------------------------------------- DB Access Functions --------------------------------------

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

        Logger.log(xml);

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

// ---------------- Subscription ----------------

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

// ---------------- Movies ----------------

// To get movies' trailer data
function getMovieTrailerData(title){

    var responseJSON = YouTube.Search.list('id,snippet', {
        q: title + "+預告",
        type: "video",
        videoCaption: "any",
        maxResults: 1
    });

    var returnJSON = {};

    returnJSON['urlVideo']      = YOUTUBE_ENDPOINT + responseJSON.items[0].id.videoId;
    returnJSON['description']   = responseJSON.items[0]['snippet']['description'];
    returnJSON['urlThumbnail']  = responseJSON.items[0]['snippet']['thumbnails']['high']['url'];

    return returnJSON;

}

// ---------------- Theater ----------------

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

// To set theater list json
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

// ---------------- User ----------------

// To add a uid
function addUser(uid){

    // Check if given uid exist in user sheet

    var ifExist = getUserRowIndex(uid) > 0 ? true : false;

    if(!ifExist){

        sheetUser.appendRow([uid, '[]']);

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

                    replySubscriptions(replyToken, uid);

                    break;

                case 'unsubscript':

                    var theaterKey = arguments[1];
                    var theaterName = configTheaters[theaterKey].name;

                    removeSubscription(uid, theaterKey);

                    replySimpleMessage(replyToken, "已取消訂閱 " + theaterName);

                    break;

                case 'subscript':

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
