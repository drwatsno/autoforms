/*
 *     Copyright (c) 2016. Dmitriy Gajewski
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* 1.00

 Plugin is designed to automatically validate the form when you hover on submit associated with this form
 For proper operation of the script, you need to add the type of validation attribute 'data-field-type' to fields.
 Optional fields are marked with attribute data-required = 'false'.

 *
 *  Usage: autoform.init(htmlObject,options)
 *
 *  valid values for data-field-type:
 *  text-all - validate any text
 *  text-url - validate only latin symbols
 *  date - validate only numbers and separators
 *  phone - validate only numbers
 *  maskphone - validate only numbers and ()/+
 *  radio - validate only if one of radios in group is selected
 *  e-mail - validate only if input value contains @ and . symbols
 *  checkbox - validate only if checked
 *
 *  */

"use strict";

var AutoForm = function (htmlElementNode, options) {
    var thisAutoform = this;

    var Field = function (node) {
        this.node = node;
        this.data = node.dataset;
        this.empty = false;
        this.valid = false;
    };

    Field.prototype.validate = function () {
        this.empty = this.node.value === "";
        if (!this.empty ) { // if field is not empty
            switch (this.data.fieldType) { // begin validation
                case "text-all": this.valid = true; break; // any text
                case "text-url": this.valid = true; break; // any text
                case "date": this.valid = true; break;     // TODO: validate date
                case "phone": this.valid = true; break;    // TODO: validate phone
                case "maskphone": this.valid = this.node.value.indexOf("_")<0; break;
                case "radio": this.valid = thisAutoform.querySelector("input[name='"+this.node.getAttribute("name")+"']:checked").value != undefined||(!this.data.required); break;
                case "email":  // in e-mail we search for '@' and '.' symbols
                    this.valid = ((String(this.node.value).indexOf("@") > -1) && (String(this.node.value).indexOf(".") > -1));
                    if (!this.valid) { thisAutoform.errorString = "Неправильный email"; }
                    break;
                case "checkbox":
                    this.valid = true; break;
                case "number": this.valid = true; break; // TODO: validate numbers
            }
            if (this.data.crossValid) {
                if (document.querySelector("#"+this.data.crossValid).value !== "") this.valid = true;
            }
            // returning this.valid property after validation
            return this.valid;
        }
        else {
            // field is empty
            if ((this.data.required !== true)&&(this.data.required !== undefined)) {
                // but not required
                this.valid = true;
                // skipping
                return this.valid;
            }
            else {
                //   console.log(this);
                //  but if required
                thisAutoform.errorString = "Незаполнены обязательные поля";
                // marking as not valid and changing errorString
                this.valid = false;
                if (this.data.crossValid) {
                    if (document.querySelector("#"+this.data.crossValid).value !== "") this.valid = true;
                }
                return this.valid;
            }
        }
    };
    this.options = {
        ShowErrorMsg       : options.ShowErrorMsg||false,
        ErrorMsgContainer  : options.ErrorMsgContainer||".autoforms-errors",
        EnableAnimations   : options.EnableAnimations||true,
        DeactivateSubmit   : options.DeactivateSubmit||true,
        FormInvalidClass   : options.FormInvalidClass||true,
        InvalidKeyErrorMsg : options.InvalidKeyErrorMsg||true,
        InvalidKeyTimeout  : options.InvalidKeyTimeout||1000,
        CancelButton       : options.CancelButton||".cancel",
        CancelErrorMsg     : options.CancelErrorMsg||false,
        PositiveValidation : options.PositiveValidation||true
    };
    this.valid = false;
    this.node = htmlElementNode;
    this.errorString = "";
    this.submit = this.node.querySelector('input[type="submit"]').length < 1?document.querySelector('input[form="' + this.node.id + '"]'):this.node.querySelector('input[type="submit"]');
    this.fields = [];
    var fields = this.node.querySelectorAll('input[type="text"], input[type="password"], input[type="checkbox"], input[type="radio"], select, textarea input[type="text"][form="' + this.node.id + '"], select[form="' + this.node.id + '"], input[type="radio"][form="' + this.node.id + '"]');
    for (var i=0; i< fields.length; i++) {
        this.fields.push(new Field(fields[i]));
    }
};

AutoForm.prototype.validate = function () {
    this.valid = true;
    for (var i=0; i< this.fields.length; i++) {

        if (this.fields[i].validate()) {
        }
        else {
            this.valid = false;
        }
    }
    return this.valid;
};

AutoForm.prototype.initEvents = function () {
    var _this = this;

    function validateCheckEventsRun() {
        if (_this.validate()) {
            if (_this.options.FormInvalidClass) {
                _this.node.classList.remove("autoform-form-invalid");
            }
            if (_this.options.DeactivateSubmit) {
                _this.submit.parentElement.classList.remove("autoform-submit-invalid");
                _this.submit.attributes.removeNamedItem("disabled");
            }
        }
        else {
            if (_this.options.FormInvalidClass) {
                _this.node.classList.add("autoform-form-invalid");
            }
            if (_this.options.DeactivateSubmit) {
                _this.submit.parentElement.classList.add("autoform-submit-invalid");
                _this.submit.attributes.disabled = "disabled";
            }
        }
    }

    for (var i=0; i< _this.fields.length; i++) {
        (function () {
            var currentField = _this.fields[i];
            var noLimit = false,
                checkString,
                keyErrWrap,
                additionalValidation = true;

            currentField.node.addEventListener("keyup", function () {
                validateCheckEventsRun();
            });
            currentField.node.addEventListener("change", function () {
                validateCheckEventsRun();
            });
            currentField.node.addEventListener("click", function () {
                validateCheckEventsRun();
                document.querySelector(_this.options.ErrorMsgContainer).innerHTML = "";
                this.classList.remove("autoform-invalid");
            });
            currentField.node.addEventListener("keypress", function (evt) {
                var invalidKeyErrorMsg = "Недопустимый символ";
                if (evt.keyCode === 13) {
                    if ((_this.submit.attributes.disabled !== 'disabled')&&(this.tagName!=="TEXTAREA")) {
                        _this.submit.click();
                    }
                }

                switch (currentField.data.fieldType) {
                    case "text-all": noLimit = true; break;
                    case "checkbox": noLimit = true; break;
                    case "text-url": checkString = "13 49 50 51 52 53 54 55 56 57 48 45 61 95 43 113 119 101 114 116 121 117 105 111 112 91 93 97 115 100 102 103 104 106 107 108 59 39 122 120 99 118 98 110 109 44 46 47 81 87 69 82 84 89 85 73 79 80 123 125 124 65 83 68 70 71 72 74 75 76 58 90 88 67 86 66 78 77 60 62 63";
                        invalidKeyErrorMsg = "Используйте только латинницу";
                        break;
                    case "date":     checkString = "13 47 46 49 50 51 52 53 54 55 56 57 48";
                        additionalValidation = (currentField.node.value.length < 10);
                        invalidKeyErrorMsg = "Используйте только цифры и разделители";
                        break;
                    case "email":   checkString = "13 48 49 50 51 52 53 54 55 56 57 46 64 113 119 101 114 116 121 117 105 111 112 97 115 100 102 103 104 106 107 108 122 120 99 118 98 110 109 45 81 87 69 82 84 89 85 73 79 80 65 83 68 70 71 72 74 75 76 90 88 67 86 66 78 77";
                        invalidKeyErrorMsg = "Используйте только латинницу";
                        break;
                    case "phone":   checkString = "40 41 43 45 13 48 49 50 51 52 53 54 55 56 57 40 41 45";
                        invalidKeyErrorMsg = "Используйте только цифры";
                        break;
                    case "number":   checkString = "48 49 50 51 52 53 54 55 56 57";
                        invalidKeyErrorMsg = "Используйте только цифры";
                        break;
                    case "maskphone":   checkString = "40 41 43 45 13 48 49 50 51 52 53 54 55 56 57 40 41 45";
                        invalidKeyErrorMsg = "Используйте только цифры";
                        break;
                    case "hunter-certificate":
                        noLimit = true;
                        break;

                }
                if (additionalValidation && (!noLimit) && (checkString.search(evt.which) === -1)) {
                    if (_this.options.InvalidKeyErrorMsg) {
                        if (currentField.data.keyerrwrapid) {
                            keyErrWrap = document.querySelector("#" + currentField.data.keyerrwrapid);
                        } else {
                            keyErrWrap = document.querySelector("#autoforms_errors");
                            if (keyErrWrap.length < 1) {
                                document.querySelector(_this.options.ErrorMsgContainer).innerHTML = '<div id="autoforms_errors" style="opacity: 0"></div>';
                                keyErrWrap = document.querySelector("#autoforms_errors");
                            }
                        }

                        keyErrWrap.style.opacity = 1;
                        if (keyErrWrap.querySelector(".keyerr").length < 1) {
                            keyErrWrap.innerHTML = keyErrWrap.innerHTML + '<span class="keyerr" style="opacity: 1">' + invalidKeyErrorMsg + '</span>';
                            setTimeout(function () {
                                keyErrWrap.querySelector(".keyerr").style.opacity = 0;
                                keyErrWrap.querySelector(".keyerr").remove();
                            }, 900);
                        }

                    }
                    return false;
                } else {
                    if (_this.options.InvalidKeyErrorMsg) {
                        document.querySelector("#autoforms_errors .keyerr").style.opacity = 0;
                        document.querySelector("#autoforms_errors .keyerr").remove();
                    }
                }
            });

            if (_this.options.PositiveValidation) {
                currentField.node.addEventListener("focusout", function(){
                    if (currentField.validate()) {
                        currentField.classList.add("valid");
                    }
                });
                currentField.node.addEventListener("focusin", function(){
                    currentField.classList.remove("valid");
                });
            }
        })();
    }
};

window.autoform = {
    widgets: {}, // all widgets with inited autoform
    init: function (htmlElementNode, options) {
        var aufm = this,

            newElementName = (htmlElementNode.className+htmlElementNode.id).toLowerCase().replace(new RegExp("[^[a-zA-Z0-9]]*","g"),'_');

        if (!options) options = {};

        var newAufmWidget = aufm.widgets[newElementName] = new AutoForm(htmlElementNode, options);
            newAufmWidget.initEvents();

    }
};