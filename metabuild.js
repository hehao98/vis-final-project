const fs = require('fs')
const metaAll = require('./dist/meta.json')

const weekdates = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fir', 'Sat', 'Sun'])

let isdebug = false
//isdebug = true

let MailLength = metaAll.length
let message_idArray = []
let timeline = []
let inreplyto = []

function stringcmp(as, bs){
  let la = as.length
  let lb = bs.length
  for (let i=0; i<Math.min(la, lb); i++){
    if (as[i]>bs[i]){
      return 1
    } else if (as[i]<bs[i]){
      return -1
    }
  }
  if (la>lb){
    return 1
  } else if (lb>la){
    return -1
  } else {
    return 0
  }
}

/* give message_id and message_idArray, return id in metaAll or -1 if not found*/
function messageID2id(message_id, message_idArray){
  message_id = String(message_id)
  let l = 0, r = message_idArray.length-1
  //console.log(message_id)
  while (l<=r){
    //console.log(l*4+' '+r*4)
    let m = ((r - l) >> 1) + l
    //console.log(message_id+' '+message_idArray[m].idString)
    if (stringcmp(message_id, message_idArray[m].idString)===1){
      l = m + 1
    } else if (stringcmp(message_id, message_idArray[m].idString)===-1){
      r = m - 1
    } else if (stringcmp(message_id, message_idArray[m].idString)===0){
      return message_idArray[m].id
    }
  }
  //console.log('error: cannot find messageID in messageID2id(): given '+message_id)
  return -1
}

if (isdebug)MailLength = 10

console.log(MailLength)
for (let i=0; i<MailLength; i++){
  /* meta messageid */
  let tmp = metaAll[i].meta
  let obtmp = new Object()
  obtmp.id = i
  if (tmp.MessageID[0]==='<')
    tmp.MessageID = tmp.MessageID.substring(1)
  if (tmp.MessageID[tmp.MessageID.length-1]==='>')
    tmp.MessageID = tmp.MessageID.substring(0, tmp.MessageID.length-1)
  obtmp.idString = tmp.MessageID
  message_idArray.push(obtmp)

  /* meta date split */
  let obtmp2 = new Object()
  obtmp2.id = i
  let tmptime = tmp.Date.split(/ |, |:/)
  let c = 0
  obtmp2.wd = tmptime[c]
  if (!(weekdates.has(obtmp2.wd))){
    obtmp2.wd = '???'
    c--
  }
  obtmp2.day = tmptime[++c]
  if (obtmp2.day.length<2)obtmp2.day = '0'+obtmp2.day
  obtmp2.month = tmptime[++c]
  obtmp2.year = tmptime[++c]
  obtmp2.h = tmptime[++c]
  obtmp2.m = tmptime[++c]
  obtmp2.s = tmptime[++c]
  obtmp2.delta = tmptime[++c]
  timeline.push(obtmp2)
}

message_idArray.sort(function(a, b){
  return stringcmp(a.idString, b.idString)
})

let extraref = 0
let innerref = 0

for (let i=0; i<MailLength; i++){
  let tmp = metaAll[i].meta
  /* meta inreplyto chains */  
  let obtmp3 = new Object()
  if (tmp.InReplyTo){
    obtmp3.irtString = tmp.InReplyTo.split(/<|>/)[1]
    obtmp3.irt_id = messageID2id(obtmp3.irtString, message_idArray)
    if (obtmp3.irt_id===-1) extraref++; else innerref++ 
  } else {
    obtmp3.irtString = null
    obtmp3.irt_id = -1
  }
  inreplyto.push(obtmp3)
  //console.log(JSON.stringify(obtmp3))
}
console.log(messageID2id('20030711.130245.559.382281@webmail05.lax.untd.com', message_idArray))
console.log(extraref+' '+innerref)

fs.writeFileSync('./dist/messageidTable.json', JSON.stringify(message_idArray, null, 2))
fs.writeFileSync('./dist/timeline.json', JSON.stringify(timeline, null, 2))
fs.writeFileSync('./dist/inreplyto.json', JSON.stringify(inreplyto, null, 2))
console.log('finish!')
