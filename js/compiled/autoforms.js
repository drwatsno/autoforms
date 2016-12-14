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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AUTOFORM_FIELD_INVALID_CLASS = "autoform-invalid";
var AUTOFORM_FORM_INVALID_CLASS = "autoform-form-invalid";
var AUTOFORM_SUBMIT_INVALID_CLASS = "autoform-submit-invalid";
var AUTOFORM_HOVERED_ONCE = "autoform-submit-hovered-once";
var AUTOFORM_KEYERROR_WRAP_CLASS = "autoforms_errors";
var AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS = "autoforms_errors";
var HTML5_INPUT_TYPES = ["text", "password", "checkbox", "radio", "number", "color", "date", "datetime", "datetime-local", "email", "range", "search", "tel", "time", "url", "month", "week"];

var E_VALIDATION = 100;
var E_EMPTY = 101;
var E_EMPTY_CHECKBOX = 102;

var ErrorMessage = function ErrorMessage(field) {
    _classCallCheck(this, ErrorMessage);

    if (!field.empty) {
        this.message = field.autoFormLink.options.Validators[field.type].errorMessage + " " + (field.nodeLink.dataset.name || field.nodeLink.name);
        if (field.type !== "checkbox") {
            this.type = E_VALIDATION;
        } else {
            this.type = E_EMPTY_CHECKBOX;
        }
    } else {
        this.message = (field.nodeLink.dataset.name || field.nodeLink.name) + " is empty";
        this.type = E_EMPTY;
    }
    this.field = field;
};

var Field = function () {
    /**
     * Field class describes single field.
     * @param node
     * @param autoForm
     */

    function Field(node, autoForm) {
        _classCallCheck(this, Field);

        var currentField = this;
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


    _createClass(Field, [{
        key: "addFieldActions",
        value: function addFieldActions() {
            var currentField = this;
            var allowAllSymbols = false,
                checkString = void 0,
                additionalValidation = true;

            currentField.nodeLink.addEventListener("keyup", function () {
                return currentField.autoFormLink.updateState();
            });
            currentField.nodeLink.addEventListener("change", function () {
                return currentField.autoFormLink.updateState();
            });
            currentField.nodeLink.addEventListener("click", function () {
                currentField.autoFormLink.updateState();
                this.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
            });
            currentField.nodeLink.addEventListener("keypress", function (evt) {
                if (evt.keyCode === 13 && currentField.autoFormLink.submit.attributes.disabled !== "disabled" && this.tagName !== "TEXTAREA") {
                    currentField.autoFormLink.submit.click();
                }

                if (currentField.autoFormLink.options.Validators[currentField.type].keypressValidatorFunction) {
                    additionalValidation = currentField.autoFormLink.options.Validators[currentField.type].keypressValidatorFunction(currentField);
                }
                if (currentField.autoFormLink.options.Validators[currentField.type].keys) {
                    checkString = currentField.autoFormLink.options.Validators[currentField.type].keys.split("").map(function (char) {
                        return char.charCodeAt();
                    }).join(" ") + " 8 9 10 13";
                } else {
                    allowAllSymbols = true;
                }

                if (additionalValidation && !allowAllSymbols && checkString.search(evt.which) === -1) {
                    evt.preventDefault();
                    return false;
                    //TODO: add popup keyerror messages
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
                currentField.nodeLink.addEventListener("focusin", function () {
                    currentField.nodeLink.classList.remove("valid");
                });
            }
        }

        /**
         * Method validates single field
         * @param callFromGroup if called from group validator
         * @returns {boolean|*}
         */

    }, {
        key: "validate",
        value: function validate(callFromGroup) {
            var self = this;
            self.empty = self.nodeLink.value === "";
            if (!self.empty) {
                // if field is not empty
                if (self.autoFormLink.options.Validators[self.type]) {
                    if (self.autoFormLink.options.Validators[self.type].validatorFunction) {
                        self.valid = self.autoFormLink.options.Validators[self.type].validatorFunction(self);
                    } else {
                        self.valid = true;
                    }
                } else {
                    self.valid = true;
                }
            } else {
                if (self.dataOpts.required !== true && self.dataOpts.required !== undefined) {
                    self.valid = true;
                } else {
                    self.autoFormLink.errorString = "Fill up required fields";
                    self.valid = false;
                }
            }
            if (self.dataOpts.group && !callFromGroup) {
                self.valid = self.autoFormLink.validateGroupWithOperator(self.dataOpts.group, self.dataOpts.groupValidateOperator);
            }
            return self.valid;
        }
    }]);

    return Field;
}();

/**
 * AutoForm class constructor. Accepts html node as first argument (usually form element, but can be any of its parents too)
 * @param htmlElementNode
 * @param options
 * @constructor
 */

var AutoForm = function () {
    function AutoForm(htmlElementNode, options) {
        _classCallCheck(this, AutoForm);

        var thisAutoForm = this;

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
                    "keypressValidatorFunction": function keypressValidatorFunction(field) {
                        return field.nodeLink.value.length < 10;
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
                        var checkedVals = field.autoFormLink.nodeLink.querySelector("input[name=\"" + field.nodeLink.getAttribute("name") + "\"]:checked");
                        return checkedVals ? checkedVals.value !== undefined || !field.dataOpts.required : false;
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
                    "validatorFunction": function validatorFunction(field) {
                        return (/\S+\@\S+\.[a-z]+/i.test(field.nodeLink.value)
                        );
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
            EnableAnimations: options.EnableAnimations || true,
            DeactivateSubmit: options.DeactivateSubmit || true,
            FormInvalidClass: options.FormInvalidClass || true,
            // InvalidKeyErrorMsg: options.InvalidKeyErrorMsg || true,
            // InvalidKeyTimeout: options.InvalidKeyTimeout || 1000,
            // TODO: return this options when keypress errors will be complete
            CancelButton: options.CancelButton || ".cancel",
            CancelErrorMsg: options.CancelErrorMsg || false,
            PositiveValidation: options.PositiveValidation || true,
            LeaveUnvalidHighlights: options.LeaveUnvalidHighlights || false
        };
        for (var key in options.Validators) {
            if (options.Validators.hasOwnProperty(key)) {
                this.options.Validators[key] = options.Validators[key];
            }
        }
        this.valid = false;
        this.nodeLink = htmlElementNode;
        this.updateFields();
        if (MutationObserver) {
            var observer = new MutationObserver(function (mutations) {
                var update = false;
                mutations.forEach(function (mutation) {
                    if (mutation.type === "childList" && mutation.target.classList[0] !== AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS) {
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


    _createClass(AutoForm, [{
        key: "pushError",
        value: function pushError(error) {
            var addToStack = true;
            this.errorStack.emptyErrors.concat(this.errorStack.validationErrors.concat(this.errorStack.emptyCheckboxes)).forEach(function (err) {
                if (error.message === err.message) {
                    addToStack = false;
                }
            });
            if (addToStack) {
                switch (error.type) {
                    case E_EMPTY:
                        {
                            this.errorStack.emptyErrors.push(error);
                        }break;
                    case E_EMPTY_CHECKBOX:
                        {
                            this.errorStack.emptyCheckboxes.push(error);
                        }break;
                    case E_VALIDATION:
                        {
                            this.errorStack.validationErrors.push(error);
                        }break;
                    default:
                        {
                            this.errorStack.emptyErrors.push(error);
                        }
                }
            }
        }

        /**
         * Clear error stack
         */

    }, {
        key: "clearErrors",
        value: function clearErrors() {
            this.errorStack.emptyErrors = [];
            this.errorStack.validationErrors = [];
            this.errorStack.emptyCheckboxes = [];
        }

        /**
         * updates fields list in object (you can call this method to update fields if form changed)
         */

    }, {
        key: "updateFields",
        value: function updateFields() {
            var thisAutoForm = this;

            this.submit = this.nodeLink.querySelector("input[type=\"submit\"]") || this.nodeLink.querySelector("button[type=\"submit\"]") || document.querySelector("input[form=\"" + this.nodeLink.id + "\"]") || document.querySelector("button[form=\"" + this.nodeLink.id + "\"]") || this.nodeLink.querySelector("button");
            this.fields = [];
            var thisNodeId = this.nodeLink.id;
            var fields = this.nodeLink.querySelectorAll(HTML5_INPUT_TYPES.map(function (fieldTypeHTML) {
                return "input[type=\"" + fieldTypeHTML + "\"], input[type=\"" + fieldTypeHTML + "\"][form=\"" + thisNodeId + "\"]";
            }).join(", ") + ", select, " + "textarea, " + ("select[form=\"" + this.nodeLink.id + "\"]"));

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var field = _step.value;

                    this.fields.push(new Field(field, thisAutoForm));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        /**
         * returns array of fields filtered by group
         * @param groupName
         * @returns {Array.<*>}
         */

    }, {
        key: "getFieldsByGroup",
        value: function getFieldsByGroup(groupName) {
            var thisAutoForm = this;
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

    }, {
        key: "validateGroupWithOperator",
        value: function validateGroupWithOperator(groupName, operator) {
            var thisAutoForm = this,
                fields = thisAutoForm.getFieldsByGroup(groupName),
                groupValid = false;
            switch (operator) {
                case "or":
                    {
                        fields.forEach(function (field) {
                            if (field.validate(true)) {
                                groupValid = true;
                            }
                        });
                    }break;
                case "and":
                    {
                        groupValid = true;
                        fields.forEach(function (field) {
                            if (!field.validate(true)) {
                                groupValid = false;
                            }
                        });
                    }break;
                default:
                    {
                        groupValid = true;
                        fields.forEach(function (field) {
                            if (!field.validate(true)) {
                                groupValid = false;
                            }
                        });
                    }break;
            }

            return groupValid;
        }

        /**
         * Checks all fields of form. If at least one field is not valid (validate() method returns false) returns false
         * @returns {boolean}
         */

    }, {
        key: "validate",
        value: function validate() {
            var self = this;
            self.clearErrors();
            self.valid = true;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = self.fields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var field = _step2.value;

                    if (!field.validate()) {
                        self.valid = false;
                        self.pushError(new ErrorMessage(field));
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return self.valid;
        }
    }, {
        key: "updateState",


        /**
         * This method run actions that changes form states
         */
        value: function updateState() {
            var self = this;
            if (self.validate()) {
                try {
                    self.nodeLink.querySelector("." + AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS).innerHTML = "";
                    if (self.options.FormInvalidClass) {
                        self.nodeLink.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
                    }
                    if (self.options.DeactivateSubmit) {
                        self.submit.parentElement.classList.remove(AUTOFORM_SUBMIT_INVALID_CLASS);
                        self.submit.removeAttribute("disabled");
                    }
                } catch (e) {
                    console.log("(Error) in autoforms: " + e.message);
                }
            } else {
                if (self.options.PrettyPrintErrors) {
                    try {
                        self.nodeLink.querySelector("." + AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS).innerHTML = function () {
                            if (self.errorStack.emptyErrors.length > 0) {
                                return "<div class=\"empty-errors\">\n                                            <div class=\"title\">The following fields is empty:</div>\n                                            <div class=\"error-list\">\n                                                " + self.errorStack.emptyErrors.map(function (err) {
                                    return "<span class=\"error-message\">" + (err.field.dataOpts.name || err.field.nodeLink.name) + "</span>";
                                }).join("") + "\n                                            </div>\n                                         </div>";
                            } else {
                                return "";
                            }
                        }() + "\n                    " + function () {
                            if (self.errorStack.validationErrors.length > 0) {
                                return "<div class=\"validation-errors\">\n                                        <div class=\"title\">Check the correctness of the fields:</div>\n                                        <div class=\"error-list\">\n                                            " + self.errorStack.validationErrors.map(function (err) {
                                    return "<span class=\"error-message\">" + (err.field.dataOpts.name || err.field.nodeLink.name) + "</span>";
                                }).join("") + "\n                                        </div>\n                                     </div>";
                            } else {
                                return "";
                            }
                        }() + "\n                    " + function () {
                            if (self.errorStack.emptyCheckboxes.length > 0) {
                                return "<div class=\"empty-checkboxes-errors\">\n                                        <div class=\"title\">Check the checkboxes:</div>\n                                        <div class=\"error-list\">\n                                            " + self.errorStack.emptyCheckboxes.map(function (err) {
                                    return "<span class=\"error-message\">" + (err.field.dataOpts.name || err.field.nodeLink.name) + "</span>";
                                }).join("") + "\n                                        </div>\n                                     </div>";
                            } else {
                                return "";
                            }
                        }();
                    } catch (e) {
                        console.log("(Error) in autoforms: " + e.message);
                    }
                } else {
                    try {
                        self.nodeLink.querySelector("." + AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS).innerHTML = self.errorStack.emptyErrors.concat(self.errorStack.validationErrors.concat(self.errorStack.emptyCheckboxes)).map(function (err) {
                            return "<span class=\"error-message\">" + err.message + "</span><br>";
                        }).join("");
                    } catch (e) {
                        console.log("(Error) in autoforms: " + e.message);
                    }
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

    }, {
        key: "initEvents",
        value: function initEvents() {
            var self = this;

            self.submit.parentNode.addEventListener("mouseenter", function () {
                self.highlightInvalidFields("on");
                if (!self.nodeLink.classList.contains(AUTOFORM_HOVERED_ONCE)) {
                    self.nodeLink.classList.add(AUTOFORM_HOVERED_ONCE);
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
                    } else {
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
            } else {
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
                });
                document.querySelector(self.options.CancelButton).addEventListener("mouseleave", function () {
                    self.errorString = "";
                    if (self.options.EnableAnimations) {
                        document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).style.opacity = 0;
                    } else {
                        document.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "";
                    }
                });
            }
        }

        /**
         * This method just highlighting invalid fields.
         * @param opts (off|on) off - removes highlight class from fields
         */

    }, {
        key: "highlightInvalidFields",
        value: function highlightInvalidFields(opts) {
            var self = this;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = self.fields[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var field = _step3.value;

                    if (opts !== "off") {
                        if (field.validate()) {
                            field.nodeLink.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
                        } else {
                            field.nodeLink.classList.add(AUTOFORM_FIELD_INVALID_CLASS);
                        }
                    }

                    if (opts === "off") {
                        field.nodeLink.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }]);

    return AutoForm;
}();

var autoforms = {
    widgets: {}, // all widgets with inited autoform
    init: function init(htmlElementNode, options) {
        if (htmlElementNode) {
            var aufm = this,
                newElementName = (htmlElementNode.className + htmlElementNode.id).toLowerCase().replace(new RegExp("[^[a-zA-Z0-9]]*", "g"), "_");

            if (!options) {
                options = {};
            }

            var newAufmWidget = htmlElementNode.autoform = aufm.widgets[newElementName] = new AutoForm(htmlElementNode, options);
            newAufmWidget.initEvents();
        } else {
            console.error("Error: trying to init autoforms on undefined node");
        }
    }
};
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports) {
        module.exports = factory;
    } else {
        root.returnExports = factory;
    }
})(this, autoforms);
//# sourceMappingURL=autoforms.js.map
