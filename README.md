# WSecondMovier

全台二輪電影院LINE Bot

## 資料庫 & 後端

本服務使用Google Sheet做為資料庫，並使用其內嵌Google Apps Script，作為後端控制程式。

### 資料庫架構

資料庫共有個Sheet/Table, 分別是user、data、config。

+ user
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

+ data
<table>
  <tr>
     <th>field</th>
     <th>JSON</th>
  </tr>
  <tr>
     <td>hc1</td>
     <td><code>Theater JSON</code></td>
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


+ config
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

## 前端

使用LINE官方帳號作為本服務使用者端

## 串接外部API

[Google Youtube Data API](https://developers.google.com/youtube/v3)

[LINE Messagine API](https://developers.line.biz/en/reference/messaging-api/)
