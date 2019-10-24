# WSecondMovier

全台二輪電影院LINE Bot

## 資料庫 & 後端

本服務使用Google Sheet做為資料庫，並使用其內嵌Google Apps Script，作為後端控制程式。

### 資料庫架構

資料庫共有個Sheet/Table, 分別是user、data、config。

#### `user`
<table>
  <tr>
     <th>uid</th>
     <th>subscriptions</th>
  </tr>  
  <tr>
     <td>u123456789</td>
     <td><code>Subscriptions Theaters Array JSON</code></td>
  </tr>
</table>

+ **說明**
    + 此Sheet 為`使用者資料表`。
    + `uid` 為LINE 使用者uid，可透過`LINE Messaging API`取得。
    + `Subscriptions Theaters Array JSON` 為該`uid`使用者所訂閱的戲院鍵值陣列，如：`["hc1","tp1"]`。

#### `data`
<table>
  <tr>
     <th>field</th>
     <th>JSON</th>
  </tr>
  <tr>
     <td><code>Theater Key</code</td>
     <td><code>Theater JSON</code></td>
  </tr>
  <tr>
     <td>...</td>
     <td>...</td>
  </tr>
  <tr>
     <td>toPushTheaters</td>
     <td><code>To Push Theaters Array JSON</code></td>
  </tr>
  <tr>
     <td>theaterListJSON</td>
     <td><code>Theaters List JSON</code></td>
  </tr>
</table>

+ **說明**
    + 此Sheet 為`主資料表`
    + `Theater JSON` 為`Theater Key`對應之戲院之JSON。
    + `To Push Theaters Array JSON` 為需發更新通知之戲院代號陣列JSON。
    + `Theaters List JSON`為戲院清單JSON。
    + 範例檔案
        1.  Theater JSON : `data-theater.json`
        2.  To Push Theaters Array JSON : `data-topushtheaters.json`
        3.  Theaters List JSON: `data-theater-list.json`

#### `config`
<table>
  <tr>
     <th>config</th>
     <th>JSON</th>
  </tr>
  <tr>
     <td>theaters</td>
     <td><code>Theaters Config JSON</code></td>
  </tr>
  <tr>
     <td>youtube</td>
     <td><code>Youtube Dat API Config JSON</code></td>
  </tr>
  <tr>
     <td>line</td>
     <td><code>LINE API Config JSON</code></td>
  </tr>
</table>

+ **說明**
    + 此Sheet 為`組態資料表`
    + `Theaters Config JSON` 為該對應戲院之JSON。
    + `Youtube Dat API Config JSON` 為需發更新通知之戲院代號陣列JSON。
    + `LINE API Config JSON`為戲院清單JSON。
    + 範例檔案
        1.  Theaters Config JSON : `config-theater.json`
        2.  Youtube Dat API Config JSON : `config-youtube.json`
        3.  LINE API Config JSON: `config-line.json`

前所提及之JSON，皆以最小化儲存於Google Sheet內。

## 前端

使用LINE官方帳號作為本服務使用者端。

## Google API Key & LINE Channel Access Token

+ LINE Config 中的`ChannelAccessToken`屬性，請填入從LINE Developer後台所取得的LINE Channel Access Token。
+ Youtube Config 中的`Key`屬性，請填入從Google Developers Console所取得的 API 金鑰。 

## 串接外部API

[Google Youtube Data API](https://developers.google.com/youtube/v3)

[LINE Messagine API](https://developers.line.biz/en/reference/messaging-api/)
