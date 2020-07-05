// https://www.reddit.com/r/LearnJapanese/comments/g34sa3/i_found_a_text_dump_for_animal_crossing_on_switch/

const xml2js = require('xml2js')
const fs = require('fs')
const walk = require('walk')
const path = require('path')

const en_f = './acnh1.1msgen/TalkSNpc_USen/rco/SP_rco_01_StartingMaingame.msbt.kup'
//const ja_f = './acnh1.1msgjp/TalkSNpc_JPja/rcm/SP_rcm_01_TentCommon.msbt.kup'
const ja_f = './acnh1.1msgjp/TalkSNpc_JPja/rco/SP_rco_01_StartingMaingame.msbt.kup'


const markup = [
  [/\x0En\x01\x00/gs, '{name}'],
  [/\x0En\x00\x00/gs, '...'],
  [/\x0En\b\x00/gs, '{island}'],

  [/\x0E\x00\x03\x02\x01\x00/gs, '{blue}'],
  [/\x0E\x00\x03\x02ÿÿ/gs, '{/blue}'],
  [/\x0E\x00\x00\b\x04\x00d0K0/gs, '{object}'],
  [/\x0E\x00\x04\x00/gs, '{newpage}'],  

  ['\x0EZ\x03\x02\x00\x00', '{unknown}'],
  ['\x0E2\x15\x02\x00Í', '{unknown}'],
  ['\x0E(&\x04\x01Í\x00\x00', '{button}'],

  [/\x0E\(.\x04...\x00/gs, '{unknown_28}'],   // expression?

  [/\x0E\n\x00\x02\x1E\x00/gs, '{newline}'],
  [/\x0E\n[\x01\x03\x04\x05]\x00/gs, '{unknown_10}'],
  [/\x0E\n\x00.*?\x00/gs, '{unknown_10_0}'],
  [/\x0E\n\x02.?\x00/gs, '{unknown_10_2}'],
  [/\x0E\n\x07\x04.\x00\x00\x00/gs, '{unknown_10_7}'],
]


const unescapeHtmlEntities = (text) => {
  return text.replace(/&#x0;/g, '\x00')
}

const removeFuriganaMarkup = (text) => {
  //const furiganaMarkerPattern = /\x0E&#x0;&#x0;(..)&#x0;(.)&#x0;/gs
  const furiganaMarkerPattern = /\x0E\x00\x00(..)\x00(.)\x00/gs
  let filtered = ''
  let sourceIndex = 0
  while ((match = furiganaMarkerPattern.exec(text)) !== null) {
    filtered = filtered + text.slice(sourceIndex, match.index)
    furiganaLength = match[2].charCodeAt(0)
    sourceIndex = furiganaMarkerPattern.lastIndex + furiganaLength
  }
  filtered = filtered + text.slice(sourceIndex)
  return filtered
}

const parseEntry = (entry) => {
  let name = entry.$.NAME
  let original = entry.original[0]

  let filtered = unescapeHtmlEntities(original)
  filtered = removeFuriganaMarkup(filtered)
  for (let conversion of markup) {
    filtered = filtered.replace(conversion[0], conversion[1])
  }

 if (true || name == '008_02') { 
    console.log(name)
    //console.log([original])
    console.log([filtered])
  }
  return {
    name: name,
    text: filtered
  }
}


const parser = new xml2js.Parser({
  strict: false,
  normalizeTags: true,
});

const parseFile = (filename, callback) => {
  fs.readFile(filename, function(err, data) {
      parser.parseString(data, function (err, result) {
        if (err) {
          console.error(err)
          return
        }
        let entries = []
        for (let entry of result.kup.entries[0].entry) {
          entries.push(parseEntry(entry))
        }
      });
  });
}

const en_path = 'acnh1.1msgen'
const ja_path = 'acnh1.1msgjp'
const pairs = []

const enToJaPath = (enPath) => {
  return enPath.replace(en_path, ja_path).replace('USen', 'JPja')
}

const crawlPaths = (callback) => {
  const walker =  walk.walk(en_path)
  walker.on('file', (root, stats, next) => {
    if (stats.name.endsWith('.kup')) {
      let enPath = path.join(root, stats.name)
      let jaPath = enToJaPath(enPath)
      fs.stat(jaPath, (err, stats) => {
        if (stats && stats.isFile()) {
          pairs.push({en: enPath, ja: jaPath})
        }
        next()
      })
    } else {
      next()
    }
  })
  walker.on('end', () => {
    console.log(pairs.length)
    callback(pairs)
  })
}

crawlPaths((files) => {
  for (let filePair of files) {
    parseFile(filePair.en, (entries) => {

    })
  }
})