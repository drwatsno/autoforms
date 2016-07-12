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

const AUTOFORM_FIELD_INVALID_CLASS = "autoform-invalid";
const AUTOFORM_FORM_INVALID_CLASS = "autoform-form-invalid";
const AUTOFORM_SUBMIT_INVALID_CLASS = "autoform-submit-invalid";
const AUTOFORM_KEYERROR_CLASS = "keyerr";
const AUTOFORM_KEYERROR_WRAP_CLASS = "autoforms_errors";

class Field {
    /**
     * Field class describes single field.
     * @param node
     * @param autoForm
     */

    constructor(node,autoForm) {
        var currentField = this;
        currentField._node = node;
        currentField._data = node.dataset;
        currentField.empty = false;
        currentField.valid = false;
        currentField._autoForm = autoForm;
        currentField.addFieldActions();
    }

    /**
     * Method adds event listeners to field
     */
    addFieldActions() {
        var currentField = this;
        let allowAllSymbols = false,
            checkString,
            keyErrWrap,
            additionalValidation = true;

        currentField._node.addEventListener("keyup",() => currentField._autoForm.updateState());
        currentField._node.addEventListener("change",() => currentField._autoForm.updateState());
        currentField._node.addEventListener("click", function () {
            currentField._autoForm.updateState();
            if (document.querySelector(currentField._autoForm.options.ErrorMsgContainer)) {
                document.querySelectorAll(currentField._autoForm.options.ErrorMsgContainer).innerHTML = "";
            }

            this.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
        });
        currentField._node.addEventListener("keypress", function (evt) {
            let invalidKeyErrorMsg = "Unvalid char";
            if ((evt.keyCode === 13)&&(currentField._autoForm.submit.attributes.disabled !== 'disabled')&&(this.tagName!=="TEXTAREA")) {
                currentField._autoForm.submit.click();
            }

            if (currentField._autoForm.options.Validators[currentField._data.fieldType].keypressValidatorFunction) {
                additionalValidation = currentField._autoForm.options.Validators[currentField._data.fieldType].keypressValidatorFunction(currentField)
            }
            if (currentField._autoForm.options.Validators[currentField._data.fieldType].keys) {
                checkString = currentField._autoForm.options.Validators[currentField._data.fieldType].keys
            } else {
                allowAllSymbols = true;
            }

            if (additionalValidation && (!allowAllSymbols) && (checkString.search(evt.which) === -1)) {
                evt.preventDefault();
                if (currentField._autoForm.options.InvalidKeyErrorMsg) {
                    if (currentField._data.keyerrwrapid) {
                        keyErrWrap = document.querySelector("." + currentField._data.keyerrwrapid);
                    } else {
                        keyErrWrap = document.querySelector("."+AUTOFORM_KEYERROR_WRAP_CLASS);
                        if (keyErrWrap) {
                            document.querySelector(currentField._autoForm.options.ErrorMsgContainer).innerHTML = '<div class="'+AUTOFORM_KEYERROR_WRAP_CLASS+'" style="opacity: 0"></div>';
                            keyErrWrap = document.querySelector("."+AUTOFORM_KEYERROR_WRAP_CLASS);
                        }
                    }

                    keyErrWrap.style.opacity = 1;
                    if (keyErrWrap.querySelector("."+AUTOFORM_KEYERROR_CLASS)) {
                        keyErrWrap.innerHTML = keyErrWrap.innerHTML + '<span class="'+AUTOFORM_KEYERROR_CLASS+'" style="opacity: 1">' + invalidKeyErrorMsg + '</span>';
                        setTimeout(function () {
                            keyErrWrap.querySelectorAll("."+AUTOFORM_KEYERROR_CLASS).style.opacity = 0;
                            keyErrWrap.querySelectorAll("."+AUTOFORM_KEYERROR_CLASS).remove();
                        }, 900);
                    }

                }
                return false;
            } else {
                if (currentField._autoForm.options.InvalidKeyErrorMsg&&currentField._data.keyerrwrapid) {
                    if (document.querySelectorAll("."+AUTOFORM_KEYERROR_WRAP_CLASS+" ."+AUTOFORM_KEYERROR_CLASS)) {
                        document.querySelectorAll("."+AUTOFORM_KEYERROR_WRAP_CLASS+" ."+AUTOFORM_KEYERROR_CLASS).style.opacity = 0;
                        document.querySelectorAll("."+AUTOFORM_KEYERROR_WRAP_CLASS+" ."+AUTOFORM_KEYERROR_CLASS).remove();
                    }

                }
            }
        });

        if (currentField._autoForm.options.PositiveValidation) {
            currentField._node.addEventListener("focusout", function(){
                if (currentField.validate()) {
                    currentField._node.classList.add("valid");
                }
            });
            currentField._node.addEventListener("focusin", function(){
                currentField._node.classList.remove("valid");
            });
        }
    }

    /**
     * Method validates single field
     * @returns {boolean|*}
     */
    validate() {
        var _this = this;
        _this.empty = _this._node.value === "";
        if (!_this.empty ) { // if field is not empty
            if (_this._autoForm.options.Validators[_this._data.fieldType]) {
                if (_this._autoForm.options.Validators[_this._data.fieldType].validatorFunction) {
                    _this.valid = _this._autoForm.options.Validators[_this._data.fieldType].validatorFunction(_this);
                } else {
                    _this.valid = true;
                }
            } else {
                _this.valid = true;
            }
            if (_this._data.crossValid) {
                if (document.querySelector("#"+_this._data.crossValid).value !== "") _this.valid = true;
            }
            return _this.valid;
        }
        else {
            if ((_this._data.required !== true)&&(_this._data.required !== undefined)) {
                _this.valid = true;
                return _this.valid;
            }
            else {
                _this._autoForm.errorString = "Fill up required fields";
                _this.valid = false;
                if (_this._data.crossValid) {
                    if (document.querySelector("#"+_this._data.crossValid).value !== "") _this.valid = true;
                }
                return _this.valid;
            }
        }
    };
}

/**
 * AutoForm class constructor. Accepts html node as first argument (usually form element, but can be any of its parents to)
 * @param htmlElementNode
 * @param options
 * @constructor
 */

class AutoForm {
    constructor(htmlElementNode, options) {
        var thisAutoForm = this;

        this.options = {
            Validators         : {
                "text-all": {
                    "keys":"",
                    "errorMessage":"",
                    "validatorFunction":false,
                    "keypressValidatorFunction":false
                },
                "text-url": {
                    "keys":"13 49 50 51 52 53 54 55 56 57 48 45 61 95 43 113 119 101 114 116 121 117 105 111 112 91 93 97 115 100 102 103 104 106 107 108 59 39 122 120 99 118 98 110 109 44 46 47 81 87 69 82 84 89 85 73 79 80 123 125 124 65 83 68 70 71 72 74 75 76 58 90 88 67 86 66 78 77 60 62 63",
                    "errorMessage":"Type only latin",
                    "validatorFunction":false,
                    "keypressValidatorFunction":false
                },
                "date": {
                    "keys":"13 47 46 49 50 51 52 53 54 55 56 57 48",
                    "errorMessage":"Type only numbers and delimiters",
                    "validatorFunction":false,
                    "keypressValidatorFunction": function (field) {
                        return (field._node.value.length < 10)
                    }
                },
                "phone": {
                    "keys":"40 41 43 45 13 48 49 50 51 52 53 54 55 56 57 40 41 45",
                    "errorMessage":"Type only numbers",
                    "validatorFunction":false,
                    "keypressValidatorFunction":false
                },
                "radio": {
                    "keys":"",
                    "errorMessage":"",
                    "validatorFunction":function (field) {
                        return field._autoForm.querySelector("input[name='"+field._node.getAttribute("name")+"']:checked").value != undefined||(!field._data.required)
                    },
                    "keypressValidatorFunction":false
                },
                "email": {
                    "keys":"13 48 49 50 51 52 53 54 55 56 57 46 64 113 119 101 114 116 121 117 105 111 112 97 115 100 102 103 104 106 107 108 122 120 99 118 98 110 109 45 81 87 69 82 84 89 85 73 79 80 65 83 68 70 71 72 74 75 76 90 88 67 86 66 78 77",
                    "errorMessage":"Type only latin",
                    "validatorFunction":function (field) {
                        let valid = false;
                        valid = ((String(field._node.value).indexOf("@") > -1) && (String(field._node.value).indexOf(".") > -1));
                        if (!valid) { field._autoForm.errorString = "incorrect email"; }
                        return valid;
                    },
                    "keypressValidatorFunction":false
                },
                "checkbox": {
                    "keys":"",
                    "errorMessage":"",
                    "validatorFunction":false,
                    "keypressValidatorFunction":false
                },
                "number": {
                    "keys":"48 49 50 51 52 53 54 55 56 57",
                    "errorMessage":"Type only numbers",
                    "validatorFunction":false,
                    "keypressValidatorFunction":false
                }
            },
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
        Object.assign(this.options.Validators, options.Validators);
        this.valid = false;
        this._node = htmlElementNode;
       // this.errorString = "";
        this.submit = this._node.querySelector('input[type="submit"]').length < 1?document.querySelector('input[form="' + this._node.id + '"]'):this._node.querySelector('input[type="submit"]');
        this.fields = [];
        let fields = this._node.querySelectorAll('input[type="text"], input[type="password"], input[type="checkbox"], input[type="radio"], select, textarea, input[type="text"][form="' + this._node.id + '"], select[form="' + this._node.id + '"], input[type="radio"][form="' + this._node.id + '"]');

        for (let field of fields) {
            this.fields.push(new Field(field,thisAutoForm));
        }
    }

    /**
     * Checks all fields of form. If at least one field is not valid (validate() method returns false) returns false
     * @returns {boolean}
     */
    validate() {
        var _this = this;
        _this.valid = true;
        for (let field of _this.fields) {
            if (!field.validate()) {
                _this.valid = false;
            }
        }
        return _this.valid;
    };

    /**
     * This method run actions that changes form states
     */
    updateState() {
        var _this = this;
        if (_this.validate()) {
            if (_this.options.FormInvalidClass) {
                _this._node.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (_this.options.DeactivateSubmit) {
                _this.submit.parentElement.classList.remove(AUTOFORM_SUBMIT_INVALID_CLASS);
                _this.submit.removeAttribute("disabled");
            }
        }
        else {
            if (_this.options.FormInvalidClass) {
                _this._node.classList.add(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (_this.options.DeactivateSubmit) {
                _this.submit.parentElement.classList.add(AUTOFORM_SUBMIT_INVALID_CLASS);
                _this.submit.setAttribute("disabled","disabled");
            }
        }
    }


    /**
     * This method inits all events of form including field events and submit hover events
     */
    initEvents() {
        var _this = this;

        _this.submit.parentNode.addEventListener("mouseenter", function () {
            _this.highlightInvalidFields("on");
            if (_this.valid) {
            }
            else {
                if (_this.options.ShowErrorMsg) {
                    if (_this._node.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).length < 1) {
                        _this._node.getElementById(_this.options.ErrorMsgContainer).innerHTML = '<div class="'+AUTOFORM_KEYERROR_WRAP_CLASS+'" style="opacity: 0"></div>';
                    }
                    if (_this.options.EnableAnimations) {
                        _this._node.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "<span style='opacity:1'>"+errorString+"</span>";
                    }
                    else {
                        _this._node.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "<span style='opacity:1'>"+errorString+"</span>";
                    }
                }
            }
        });
        _this.submit.parentNode.addEventListener("mouseleave", function () {
            _this.highlightInvalidFields("off");
            if (_this.valid) {
            }
            if (_this.options.ShowErrorMsg) {
                if (_this.options.EnableAnimations) {
                    _this._node.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).style.opacity = 0;
                }
                else {
                    _this._node.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "";
                }

            }
        });


        if (_this.valid) {
            if (_this.options.FormInvalidClass) {
                _this._node.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (_this.options.DeactivateSubmit) {
                _this.submit.parentNode.classList.remove(AUTOFORM_SUBMIT_INVALID_CLASS);
                if (_this.submit.attributes.disabled) {
                    _this.submit.removeAttribute("disabled");
                }

            }
        }
        else {
            if (_this.options.FormInvalidClass) {
                _this._node.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (_this.options.DeactivateSubmit) {
                _this.submit.parentNode.classList.add(AUTOFORM_SUBMIT_INVALID_CLASS);
                _this.submit.setAttribute("disabled","disabled");
            }
        }

        if (_this.options.CancelErrorMsg) {
            document.querySelector(_this.options.CancelButton).addEventListener("mouseenter", function () {
                _this.errorString = "Будут отменены все изменения!";
                if (document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).length < 1) {
                    document.getElementById(_this.options.ErrorMsgContainer).innerHTML = '<div id="'+AUTOFORM_KEYERROR_WRAP_CLASS+'" style="opacity: 0"></div>';
                }
                if (_this.options.EnableAnimations) {
                    document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "<span style='opacity:1'>"+errorString+"</span>";
                }
                else {
                    document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "<span style='opacity:1'>"+errorString+"</span>";
                }
            });
            document.querySelector(_this.options.CancelButton).addEventListener("mouseleave", function () {
                _this. errorString = "";
                if (_this.options.EnableAnimations) {
                    document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).style.opacity = 0;
                }
                else {
                    document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "";
                }
            });
        }
    }

    /**
     * This method just highlighting invalid fields.
     * @param opts (off|on) off - removes highlight class from fields
     */
    highlightInvalidFields(opts) {
        var _this = this;
        for (let field of _this.fields) {
            if (opts !== "off") {
                if (field.valid) {
                    field._node.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
                }
                else {
                    field._node.classList.add(AUTOFORM_FIELD_INVALID_CLASS);
                }
            }

            if (opts === "off") {
                field._node.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
            }
        }
    };
}


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