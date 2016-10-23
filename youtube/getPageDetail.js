const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')
const request = require('request')
const jsonPath = path.resolve(__dirname, './../index_youtube.json')
const jsonstr = fs.readFileSync(jsonPath)
const jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js")
const jsondata = JSON.parse(jsonstr)
const count = jsondata.length
const savexlsx = require('./savexlsx')



let GET_real_data = []

function reqUrlData(index) {
    const {link} = jsondata[index]
    let url = link
    let option = {
        method: 'GET',
        url: link,
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, sdch",
            "Accept-Language": "en,zh-CN;q=0.8,zh;q=0.6,ja;q=0.4",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Cookie": "PHPSESSID=6tlbgco2bikctpt7vn6irpb8e7; __atuvc=1%7C41%2C1%7C42",
            "Host": "www.aaschool.ac.uk",
            "Pragma": "no-cache",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36"
        }
    }
    request(option, (error, response, body) => {
        if (error) {
            savedata()
            console.log(`request url ${url} error. index: ${index}`)
        }

        analysisHTML(url, body, () => {
            console.log(`end page ${url} NO:${index}`)
            if (index < count - 1) {
                // savedata()
                reqUrlData(index + 1)
            } else {
                savedata()
            }
        })
    })
}

reqUrlData(0)


function savedata() {
    fs.writeFile('./detail_pages.json', JSON.stringify(GET_real_data, null, 4))
    const filename = path.resolve(__dirname, './detail_pages.xlsx')
    savexlsx(GET_real_data, filename)
}


function analysisHTML(url, body, cb) {
    jsdom.env({
        html: body,
        src: [jquery],
        done: function(err, window) {
            if (err) {
                savedata()
                console.log(`jsdom error ${err}`)
            }
            let $ = window.$

            const videoLink = $('iframe').get(0).src
            const $lblSpeaker = $('#lblSpeaker')
            let $lblInfo = $('#lblInfo')
            let $lblDescription = $("#lblDescription")
            const info = $lblInfo.text()
            const detail = $lblDescription.text()
            const imgs = $lblDescription.find("img")
            const imgUrls = []
            imgs.each( (i) => {
                let imgSrc = imgs.get(0).src
                imgUrls.push(imgSrc)
            })

            const idReg = /\/(\w*)\?rel=0/g
            const arr = idReg.exec(videoLink)
            const youtube = arr ? `https://www.youtube.com/watch?v=${arr[1]}` : videoLink

            console.log(arr)

            GET_real_data.push({
                speaker: $lblSpeaker.text(),
                title: $('#lblTitle').text(),
                url,
                videoLink,
                youtube,
                info,
                detail,
                imgs: imgUrls.join(',')
            })
            cb()
        }
    });
}