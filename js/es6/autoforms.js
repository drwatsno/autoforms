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

"use strict";

const AUTOFORM_FIELD_INVALID_CLASS = "autoform-invalid";
const AUTOFORM_FORM_INVALID_CLASS = "autoform-form-invalid";
const AUTOFORM_SUBMIT_INVALID_CLASS = "autoform-submit-invalid";
const AUTOFORM_KEYERROR_CLASS = "keyerr";
const AUTOFORM_HOVERED_ONCE = "autoform-submit-hovered-once";
const AUTOFORM_KEYERROR_WRAP_CLASS = "autoforms_errors";
const AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS = "autoforms_errors";
const HTML5_INPUT_TYPES = ["text", "password", "checkbox", "radio", "number", "color", "date", "datetime", "datetime-local", "email", "range", "search", "tel", "time", "url", "month", "week"];

const E_VALIDATION = 100;
const E_EMPTY = 101;
const E_EMPTY_CHECKBOX = 102;

class ErrorMessage {
    constructor(field) {
        if (!field.empty) {
            this.message = field.autoFormLink.options.Validators[field.type].errorMessage + " " + (field.nodeLink.dataset.name || field.nodeLink.name);
            if (field.type !== "checkbox") {
                this.type = E_VALIDATION;
            } else {
                this.type = E_EMPTY_CHECKBOX;
            }
        } else {
            this.message = `${field.nodeLink.dataset.name || field.nodeLink.name} is empty`;
            this.type = E_EMPTY;
        }
        this.field = field;
    }
}

class Field {
    /**
     * Field class describes single field.
     * @param node
     * @param autoForm
     */

    constructor(node, autoForm) {
        let currentField = this;
        currentField.nodeLink = node;
        node.autoformField = currentField;
        currentField.dataOpts = node.dataset;
        currentField.type = currentField.dataOpts.fieldType || (currentField.nodeLink.attributes.type ? currentField.nodeLink.attributes.type.value : "text");
        currentField.empty = false;
        currentField.valid = false;
        currentField.autoFormLink = autoForm;
        currentField.addFieldActions();
    }

    /**
     * Method adds event listeners to field
     */
    addFieldActions() {
        let currentField = this;
        let allowAllSymbols = false,
            checkString,
            keyErrWrap,
            additionalValidation = true;

        currentField.nodeLink.addEventListener("keyup", () => currentField.autoFormLink.updateState());
        currentField.nodeLink.addEventListener("change", () => currentField.autoFormLink.updateState());
        currentField.nodeLink.addEventListener("click", function () {
            currentField.autoFormLink.updateState();
            if (document.querySelector(currentField.autoFormLink.options.ErrorMsgContainer)) {
                document.querySelectorAll(currentField.autoFormLink.options.ErrorMsgContainer).innerHTML = "";
            }

            this.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
        });
        currentField.nodeLink.addEventListener("keypress", function (evt) {
            //let invalidKeyErrorMsg = "Unvalid char";
            if ((evt.keyCode === 13) && (currentField.autoFormLink.submit.attributes.disabled !== "disabled") && (this.tagName !== "TEXTAREA")) {
                currentField.autoFormLink.submit.click();
            }

            if (currentField.autoFormLink.options.Validators[currentField.type].keypressValidatorFunction) {
                additionalValidation = currentField.autoFormLink.options.Validators[currentField.type].keypressValidatorFunction(currentField);
            }
            if (currentField.autoFormLink.options.Validators[currentField.type].keys) {
                checkString = currentField.autoFormLink.options.Validators[currentField.type].keys.split("").map(
                    function(char){
                        return char.charCodeAt();
                    }).join(" ") + " 8 9 10 13";
            } else {
                allowAllSymbols = true;
            }

            if (additionalValidation && (!allowAllSymbols) && (checkString.search(evt.which) === -1)) {
                evt.preventDefault();
                if (currentField.autoFormLink.options.InvalidKeyErrorMsg) {
                    if (currentField.dataOpts.keyerrwrapid) {
                        keyErrWrap = document.querySelector("." + currentField.dataOpts.keyerrwrapid);
                    } else {
                        keyErrWrap = document.querySelector("." + AUTOFORM_KEYERROR_WRAP_CLASS);
                        if (keyErrWrap) {
                            document.querySelector(currentField.autoFormLink.options.ErrorMsgContainer).innerHTML = `<div class="${AUTOFORM_KEYERROR_WRAP_CLASS}" style="opacity: 0"></div>`;
                            keyErrWrap = document.querySelector("." + AUTOFORM_KEYERROR_WRAP_CLASS);
                        }
                    }
                    if (keyErrWrap) {
                        keyErrWrap.style.opacity = 1;
                        if (keyErrWrap.querySelector("." + AUTOFORM_KEYERROR_CLASS)) {
                            keyErrWrap.innerHTML = keyErrWrap.innerHTML + `<span class="${AUTOFORM_KEYERROR_CLASS}" style="opacity: 1">" + invalidKeyErrorMsg + "</span>`;
                            setTimeout(function () {
                                keyErrWrap.querySelectorAll("." + AUTOFORM_KEYERROR_CLASS).style.opacity = 0;
                                keyErrWrap.querySelectorAll("." + AUTOFORM_KEYERROR_CLASS).remove();
                            }, 900);
                        }
                    }
                }
                return false;
            } else {
                if (currentField.autoFormLink.options.InvalidKeyErrorMsg && currentField.dataOpts.keyerrwrapid) {
                    if (document.querySelectorAll("." + AUTOFORM_KEYERROR_WRAP_CLASS + " ." + AUTOFORM_KEYERROR_CLASS)) {
                        document.querySelectorAll("." + AUTOFORM_KEYERROR_WRAP_CLASS + " ." + AUTOFORM_KEYERROR_CLASS).style.opacity = 0;
                        document.querySelectorAll("." + AUTOFORM_KEYERROR_WRAP_CLASS + " ." + AUTOFORM_KEYERROR_CLASS).remove();
                    }

                }
            }
        });

        if (currentField.autoFormLink.options.PositiveValidation) {
            currentField.nodeLink.addEventListener("focusout", function () {
                if (currentField.validate()) {
                    currentField.nodeLink.classList.add("valid");
                    currentField.nodeLink.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
                } else {
                    if (currentField.autoFormLink.options.LeaveUnvalidHighlights && currentField.autoFormLink.nodeLink.classList.contains(AUTOFORM_HOVERED_ONCE)) {
                        currentField.nodeLink.classList.add(AUTOFORM_FIELD_INVALID_CLASS);
                    }
                }
            });
            currentField.nodeLink.addEventListener("focusin", function(){
                currentField.nodeLink.classList.remove("valid");
            });
        }
    }

    /**
     * Method validates single field
     * @param callFromGroup if called from group validator
     * @returns {boolean|*}
     */
    validate(callFromGroup) {
        let self = this;
        self.empty = self.nodeLink.value === "";
        if (!self.empty ) { // if field is not empty
            if (self.autoFormLink.options.Validators[self.type]) {
                if (self.autoFormLink.options.Validators[self.type].validatorFunction) {
                    self.valid = self.autoFormLink.options.Validators[self.type].validatorFunction(self);
                } else {
                    self.valid = true;
                }
            } else {
                self.valid = true;
            }
        }
        else {
            if ((self.dataOpts.required !== true) && (self.dataOpts.required !== undefined)) {
                self.valid = true;
            }
            else {
                self.autoFormLink.errorString = "Fill up required fields";
                self.valid = false;
            }
        }
        if (self.dataOpts.group && !callFromGroup) {
            self.valid = self.autoFormLink.validateGroupWithOperator(self.dataOpts.group, self.dataOpts.groupValidateOperator);
        }
        return self.valid;
    };
}

/**
 * AutoForm class constructor. Accepts html node as first argument (usually form element, but can be any of its parents too)
 * @param htmlElementNode
 * @param options
 * @constructor
 */

class AutoForm {
    constructor(htmlElementNode, options) {
        let thisAutoForm = this;

        this.errorStack = {
            validationErrors: [],
            emptyErrors: [],
            emptyCheckboxes: []
        };
        this.options = {
            Validators: {
                "text": {
                    "keys": "",
                    "errorMessage": "Field is empty",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                },
                "password": {
                    "keys": "",
                    "errorMessage": "Field is empty",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                },
                "text-all": {
                    "keys": "",
                    "errorMessage": "Field is empty",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                },
                "text-url": {
                    "keys": "1234567890-=_+qwertyuiop[]asdfghjkl;\"zxcvbnm,./QWERTYUIOP{}|ASDFGHJKL:ZXCVBNM<>?",
                    "errorMessage": "Type only latin",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                },
                "url": {
                    "keys": "1234567890-=_+qwertyuiop[]asdfghjkl;\"zxcvbnm,./QWERTYUIOP{}|ASDFGHJKL:ZXCVBNM<>?",
                    "errorMessage": "Type only latin",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                },
                "date": {
                    "keys": "/.1234567890",
                    "errorMessage": "Type only numbers and delimiters",
                    "validatorFunction": false,
                    "keypressValidatorFunction": function (field) {
                        return (field.nodeLink.value.length < 10);
                    }
                },
                "phone": {
                    "keys": "()+-0123456789()-",
                    "errorMessage": "Type only numbers",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                },
                "radio": {
                    "keys": "",
                    "errorMessage": "Please check one of radiobuttons",
                    "validatorFunction": function validatorFunction(field) {
                        let checkedVals = field.autoFormLink.nodeLink.querySelector(`input[name="${field.nodeLink.getAttribute("name")}"]:checked`);
                        return checkedVals ? (checkedVals.value !== undefined || !field.dataOpts.required) : false;
                    },
                    "keypressValidatorFunction": false
                },
                "select": {
                    "keys": "",
                    "errorMessage": "Select an element in dropdown",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                },
                "email": {
                    "keys": "0123456789.@qwertyuiopasdfghjklzxcvbnm-QWERTYUIOPASDFGHJKLZXCVBNM_",
                    "errorMessage": "Email is not valid",
                    "validatorFunction": function (field) {
                        return (/\S+\@\S+\.[a-z]+/i).test(field.nodeLink.value);
                    },
                    "keypressValidatorFunction": false
                },
                "checkbox": {
                    "keys": "",
                    "errorMessage": "Please select checkbox",
                    "validatorFunction": function validatorFunction(field) {
                        if (field.nodeLink.checked) {
                            return true;
                        }
                        return typeof field.dataOpts.required !== "undefined";
                    },
                    "keypressValidatorFunction": false
                },
                "number": {
                    "keys": "0123456789",
                    "errorMessage": "Type only numbers",
                    "validatorFunction": false,
                    "keypressValidatorFunction": false
                }
            },
            ShowErrorMsg: options.ShowErrorMsg || false,
            PrettyPrintErrors: options.PrettyPrintErrors || true,
            ErrorMsgContainer: options.ErrorMsgContainer || ".autoforms-errors",
            EnableAnimations: options.EnableAnimations || true,
            DeactivateSubmit: options.DeactivateSubmit || true,
            FormInvalidClass: options.FormInvalidClass || true,
            InvalidKeyErrorMsg: options.InvalidKeyErrorMsg || true,
            InvalidKeyTimeout: options.InvalidKeyTimeout || 1000,
            CancelButton: options.CancelButton || ".cancel",
            CancelErrorMsg: options.CancelErrorMsg || false,
            PositiveValidation: options.PositiveValidation || true,
            LeaveUnvalidHighlights: options.LeaveUnvalidHighlights || false
        };
        for (let key in options.Validators) {
            if (options.Validators.hasOwnProperty(key)) {
                this.options.Validators[key] = options.Validators[key];
            }
        }
        this.valid = false;
        this.nodeLink = htmlElementNode;
        this.updateFields();
        if (MutationObserver) {
            let observer = new MutationObserver(function(mutations) {
                let update = false;
                mutations.forEach(function(mutation) {
                    if (mutation.type === "childList" && mutation.target.classList[0] !== "autoforms_errors") {
                        update = true;
                        // console.log(mutation);
                    }
                });

                if (update) {
                    thisAutoForm.updateFields();
                }
            });

            observer.observe(htmlElementNode, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    }

    /**
     * Push error to error stack
     * @param error
     */
    pushError(error) {
        let addToStack = true;
        this.errorStack.emptyErrors.concat(this.errorStack.validationErrors.concat(this.errorStack.emptyCheckboxes)).forEach(function(err) {
            if (error.message === err.message) {
                addToStack = false;
            }
        });
        if (addToStack) {
            switch (error.type) {
                case E_EMPTY: {
                    this.errorStack.emptyErrors.push(error);
                } break;
                case E_EMPTY_CHECKBOX: {
                    this.errorStack.emptyCheckboxes.push(error);
                } break;
                case E_VALIDATION: {
                    this.errorStack.validationErrors.push(error);
                } break;
                default: {
                    this.errorStack.emptyErrors.push(error);
                }
            }
        }
    }

    /**
     * Clear error stack
     */
    clearErrors() {
        this.errorStack.emptyErrors = [];
        this.errorStack.validationErrors = [];
        this.errorStack.emptyCheckboxes = [];
    }

    /**
     * updates fields list in object (you can call this method to update fields if form changed)
     */
    updateFields() {
        let thisAutoForm = this;

        this.submit = this.nodeLink.querySelector("input[type=\"submit\"]") ||
                      this.nodeLink.querySelector("button[type=\"submit\"]") ||
                      document.querySelector(`input[form="${this.nodeLink.id}"]`) ||
                      document.querySelector(`button[form="${this.nodeLink.id}"]`) ||
                      this.nodeLink.querySelector("button");
        this.fields = [];
        let thisNodeId = this.nodeLink.id;
        let fields = this.nodeLink.querySelectorAll(
            (HTML5_INPUT_TYPES.map(function (fieldTypeHTML) {
                return `input[type="${fieldTypeHTML}"], input[type="${fieldTypeHTML}"][form="${thisNodeId}"]`;
            }).join(", ")) +
            ", select, " +
            "textarea, " +
            `select[form="${this.nodeLink.id}"]`);

        for (let field of fields) {
            this.fields.push(new Field(field, thisAutoForm));
        }
    }

    /**
     * returns array of fields filtered by group
     * @param groupName
     * @returns {Array.<*>}
     */
    getFieldsByGroup(groupName) {
        let thisAutoForm = this;
        return thisAutoForm.fields.filter(function (field) {
            return field.dataOpts.group === groupName;
        });
    }

    /**
     * Validate fields grouped by data-group attribute
     * @param groupName
     * @param operator validation operator (currently "or" or "and")
     * @returns {boolean}
     */
    validateGroupWithOperator(groupName, operator) {
        let thisAutoForm = this,
            fields = thisAutoForm.getFieldsByGroup(groupName),
            groupValid = false;
        switch (operator) {
            case "or": {
                fields.forEach(function (field) {
                    if (field.validate(true)) {
                        groupValid = true;
                    }
                });
            } break;
            case "and": {
                groupValid = true;
                fields.forEach(function (field) {
                    if (!field.validate(true)) {
                        groupValid = false;
                    }
                });
            } break;
            default: {
                groupValid = true;
                fields.forEach(function (field) {
                    if (!field.validate(true)) {
                        groupValid = false;
                    }
                });
            } break;
        }

        return groupValid;
    }

    /**
     * Checks all fields of form. If at least one field is not valid (validate() method returns false) returns false
     * @returns {boolean}
     */
    validate() {
        let self = this;
        self.clearErrors();
        self.valid = true;
        for (let field of self.fields) {
            if (!field.validate()) {
                self.valid = false;
                self.pushError(new ErrorMessage(field));
            }
        }
        return self.valid;
    };

    /**
     * This method run actions that changes form states
     */
    updateState() {
        let self = this;
        if (self.validate()) {
            self.nodeLink.querySelector(`.${AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS}`).innerHTML = "";
            if (self.options.FormInvalidClass) {
                self.nodeLink.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (self.options.DeactivateSubmit) {
                self.submit.parentElement.classList.remove(AUTOFORM_SUBMIT_INVALID_CLASS);
                self.submit.removeAttribute("disabled");
            }
        }
        else {
            if (self.options.PrettyPrintErrors) {
                self.nodeLink.querySelector(`.${AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS}`).innerHTML =
                    `${(function () {
                            if (self.errorStack.emptyErrors.length > 0) {
                                return `<div class="empty-errors">
                                            <div class="title">The following fields is empty:</div>
                                            <div class="error-list">
                                                ${self.errorStack.emptyErrors.map(function (err) {
                                                        return `<span class="error-message">${err.field.dataOpts.name || err.field.nodeLink.name }</span>`;
                                                    }).join("")}
                                            </div>
                                         </div>`;
                            } else {
                                return "";
                            }
                        })()}
                    ${(function () {
                        if (self.errorStack.validationErrors.length > 0) {
                            return `<div class="validation-errors">
                                        <div class="title">Check the correctness of the fields:</div>
                                        <div class="error-list">
                                            ${self.errorStack.validationErrors.map(function (err) {
                                                return `<span class="error-message">${err.field.dataOpts.name || err.field.nodeLink.name}</span>`;
                                            }).join("")}
                                        </div>
                                     </div>`;
                        } else {
                            return "";
                        }
                    })()}
                    ${(function () {
                        if (self.errorStack.emptyCheckboxes.length > 0) {
                            return `<div class="empty-checkboxes-errors">
                                        <div class="title">Check the checkboxes:</div>
                                        <div class="error-list">
                                            ${self.errorStack.emptyCheckboxes.map(function (err) {
                                                return `<span class="error-message">${err.field.dataOpts.name || err.field.nodeLink.name}</span>`;
                                            }).join("")}
                                        </div>
                                     </div>`;
                        } else {
                            return "";
                        }
                    })()}`;
            } else {
                self.nodeLink.querySelector(`.${AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS}`).innerHTML = self.errorStack.emptyErrors.concat(self.errorStack.validationErrors.concat(self.errorStack.emptyCheckboxes)).map(function (err) {
                    return `<span class="error-message">${err.message}</span><br>`;
                }).join("");
            }
            if (self.options.FormInvalidClass) {
                self.nodeLink.classList.add(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (self.options.DeactivateSubmit) {
                self.submit.parentElement.classList.add(AUTOFORM_SUBMIT_INVALID_CLASS);
                self.submit.setAttribute("disabled", "disabled");
            }
        }
    }


    /**
     * This method inits all events of form including field events and submit hover events
     */
    initEvents() {
        let self = this;

        self.submit.parentNode.addEventListener("mouseenter", function () {
            self.highlightInvalidFields("on");
            if (!self.nodeLink.classList.contains(AUTOFORM_HOVERED_ONCE)) {
                self.nodeLink.classList.add(AUTOFORM_HOVERED_ONCE);
            }
            /*if (self.valid) {
            }*/
            else {
                if (self.options.ShowErrorMsg) {
                    if (self.nodeLink.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).length < 1) {
                        self.nodeLink.getElementById(self.options.ErrorMsgContainer).innerHTML = `<div class="${AUTOFORM_KEYERROR_WRAP_CLASS}" style="opacity: 0"></div>`;
                    }
                    if (self.options.EnableAnimations) {
                        self.nodeLink.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = `<span style="opacity:1">${self.errorString}</span>`;
                    }
                    else {
                        self.nodeLink.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = `<span style="opacity:1">${self.errorString}</span>`;
                    }
                }
            }
        });
        self.submit.parentNode.addEventListener("mouseleave", function () {
            if (!self.options.LeaveUnvalidHighlights) {
                self.highlightInvalidFields("off");
            }
            /*if (self.valid) {
            }*/
            if (self.options.ShowErrorMsg) {
                if (self.options.EnableAnimations) {
                    self.nodeLink.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).style.opacity = 0;
                }
                else {
                    self.nodeLink.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "";
                }

            }
        });


        if (self.valid) {
            if (self.options.FormInvalidClass) {
                self.nodeLink.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (self.options.DeactivateSubmit) {
                self.submit.parentNode.classList.remove(AUTOFORM_SUBMIT_INVALID_CLASS);
                if (self.submit.attributes.disabled) {
                    self.submit.removeAttribute("disabled");
                }

            }
        }
        else {
            if (self.options.FormInvalidClass) {
                self.nodeLink.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (self.options.DeactivateSubmit) {
                self.submit.parentNode.classList.add(AUTOFORM_SUBMIT_INVALID_CLASS);
                self.submit.setAttribute("disabled", "disabled");
            }
        }

        if (self.options.CancelErrorMsg) {
            document.querySelector(self.options.CancelButton).addEventListener("mouseenter", function () {
                self.errorString = "Будут отменены все изменения!";
                if (document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).length < 1) {
                    document.getElementById(self.options.ErrorMsgContainer).innerHTML = `<div id="${AUTOFORM_KEYERROR_WRAP_CLASS}" style="opacity: 0"></div>`;
                }
                if (self.options.EnableAnimations) {
                    document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = `<span style="opacity:1">${self.errorString}</span>`;
                }
                else {
                    document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = `<span style="opacity:1">${self.errorString}</span>`;
                }
            });
            document.querySelector(self.options.CancelButton).addEventListener("mouseleave", function () {
                self.errorString = "";
                if (self.options.EnableAnimations) {
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
        let self = this;
        for (let field of self.fields) {
            if (opts !== "off") {
                if (field.validate()) {
                    field.nodeLink.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
                }
                else {
                    field.nodeLink.classList.add(AUTOFORM_FIELD_INVALID_CLASS);
                }
            }

            if (opts === "off") {
                field.nodeLink.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
            }
        }
    };
}

let autoforms = {
    widgets: {}, // all widgets with inited autoform
    init: function (htmlElementNode, options) {
        if (htmlElementNode) {
            let aufm = this,

                newElementName = (htmlElementNode.className + htmlElementNode.id).toLowerCase().replace(new RegExp("[^[a-zA-Z0-9]]*", "g"), "_");

            if (!options) {
                options = {};
            }

            let newAufmWidget = htmlElementNode.autoform = aufm.widgets[newElementName] = new AutoForm(htmlElementNode, options);
            newAufmWidget.initEvents();
        } else {
            console.error("Error: trying to init autoforms on undefined node");
        }
    }
};
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory;
    } else {
        root.returnExports = factory;
    }
}(this, autoforms));
