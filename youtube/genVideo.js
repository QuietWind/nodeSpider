const fs = require('fs')
const path = require('path')
const jsonstr = fs.readFileSync(path.resolve(__dirname, './../detail_pages.json'))
const data = JSON.parse(jsonstr)
let result = []

data.forEach(ele => {
    let { youtube } = ele
    if(/^\/\/www/.test(youtube)){
        // console.log(youtube)
        youtube = `https:${youtube}`
    }
    result.push(`${youtube}`)
})


const step = 10
let count = Math.ceil(result.length/step)

saveIt(1)

function saveIt(index){
    const _dd = result.slice((index - 1) * step, index * step)
    console.log(_dd)
    fs.writeFile(`./youtube/urls/youtube_download_${index}.txt`, _dd.join('\n'))
    if(index < count){
        saveIt(index + 1)
    }else{
        console.log(`gen ok text count:${count}.`)
    }
}