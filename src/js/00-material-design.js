;(function () {
  'use strict'

  //header 
  mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar'))

  // search buttons
  mdc.textField.MDCTextField.attachTo(document.querySelector('.mdc-text-field.search'))
  var searchIcon = document.querySelector('.mdc-icon-button.search')
  mdc.iconButton.MDCIconButtonToggle.attachTo(searchIcon)
  searchIcon.addEventListener('click', function(){
    var searchTextBox = this.nextElementSibling
    if(searchTextBox.classList.contains('expanded')){
      searchTextBox.classList.remove('expanded')
    } else {
      searchTextBox.classList.add('expanded')
    }
  })




  // nav 
  var x = document.querySelectorAll('.mdc-list-item'); 
  for(var i = 0; i < x.length; i++){ 
    mdc.ripple.MDCRipple.attachTo(x[i])
    x[i].addEventListener('click', function(event){
      var item = event.target
      var panel = item.nextElementSibling
      var height, itemHasChildren = false;
      if(panel){
        itemHasChildren = panel.classList.contains('mdc-list-item--children-panel')
      }
      if(itemHasChildren){
        height = panel.scrollHeight
        var childrenPanels = panel.querySelectorAll('.mdc-list-item--children-panel')
        for(var j=0; j < childrenPanels.length; j++){
            height = height + childrenPanels[j].scrollHeight
        }
      }
      if(item.classList.contains('mdc-list-item--activated')){
        item.classList.remove('mdc-list-item--activated')
        if(itemHasChildren){
          panel.style.maxHeight = null
        }
      } else{
        item.classList.add('mdc-list-item--activated')
        if(itemHasChildren){
          panel.style.maxHeight = height + 'px'
        }
      }

    })
  }

})()


var p = document.querySelectorAll('.mdc-list-item--children-panel'); 
var maxWidth = 0; 
var pWidth
for(var i = 0; i < p.length; i++){
  pWidth = p[i].scrollWidth
  if(pWidth > maxWidth) {
    maxWidth = pWidth
  }
}
document.querySelector('.nav-container').style.width = pWidth