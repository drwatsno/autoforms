"use strict";
window.onload = function () {
  var forms = document.getElementsByClassName("au-block_form");

  for (let form of forms) {
      autoform.init(form);
  }
};