"use strict";
window.onload = function () {
  var forms = document.getElementsByClassName("au-block_form");

  for (let form of forms) {
      autoform.init(form,{
          Validators:{
              "maskphone": {
                  "keys":"40 41 43 45 13 48 49 50 51 52 53 54 55 56 57 40 41 45",
                  "errorMessage":"Type only numbers",
                  "validatorFunction":function (field) {
                      return field.valid = field._node.value.indexOf("_")<0
                  },
                  "keypressValidatorFunction":false
              }
          }
      });
  }
};