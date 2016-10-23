const request = require('request')
const jsdom = require('jsdom')
const fs = require('fs')
const path = require('path')
const process = require('process')
const jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js")
const savexlsx = require('./savexlsx')

let pageStart = 1
let pageEnd = 53
let GET_real_data = []

const baseURL = 'http://www.aaschool.ac.uk/PUBLIC/AUDIOVISUAL/videoarchive.php?page='

var urls = []
for (let i = pageStart; i <= pageEnd; i++) {
    urls.push(`${baseURL}${i}`)
}



function reqUrlData(index) {
    let url = urls[index]
    let option = {
        method: 'GET',
        url: url,
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
            console.log(`request url ${url} error.`)
        }

        analysisHTML(url, body, () => {
            console.log(`end page ${url} NO:${index}`)
            if (index < urls.length - 1) {
                reqUrlData(index + 1)
            } else {
                savedata()
            }
        })
    })
}

reqUrlData(0)


function savedata() {
    fs.writeFile('./index_youtube.json', JSON.stringify(GET_real_data, null, 4))
    const filename = path.resolve(__dirname, './index_youtube.xlsx')
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

            let listbox = $('.lecture_list')
            if (!listbox) {
                savedata()
            }
            let lectures = listbox.find('tr')

            lectures.each((i, ele) => {
                let $this = $(ele)
                let link = $this.find('td:nth-child(1) a').attr('href')
                let img = $this.find('td:nth-child(1) img').attr('src')
                let date = $this.find('td:nth-child(2)').text()
                let name = $this.find('td:nth-child(3)').text()
                let title = $this.find('td:nth-child(4)').text()
                let titlelink = $this.find('td:nth-child(4) a').attr('href')
                let runtime = $this.find('td:nth-child(5)').text()

                let itemData = {
                    url,
                    link,
                    img,
                    date,
                    name,
                    title,
                    titlelink,
                    runtime
                }

                if ( Object.keys(itemData).every(key => !!itemData[key] ) ) {
                    GET_real_data.push(itemData)
                }else{
                    console.log(`${link} cannot find data.`)
                }
            })
            cb()
        }
    });
}