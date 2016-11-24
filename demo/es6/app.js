"use strict";
window.onload = function () {
  let forms = document.getElementsByClassName("au-block_form");

  for (let form of forms) {
      autoforms.init(form, {
          Validators:{
              "maskphone": {
                  "keys": "()+-0123456789()-",
                  "errorMessage": "Type only numbers",
                  "validatorFunction": function (field) {
                      return field.valid = field.nodeLink.value.indexOf("_") < 0;
                  },
                  "keypressValidatorFunction": false
              }
          }
      });
  }
};