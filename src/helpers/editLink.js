'use strict'

function getLink(condition, page){
    if(condition){
        return page.fileUri
    } else { 
        return page.editUrl
    }
}

module.exports = getLink;