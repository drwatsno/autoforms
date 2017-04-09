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

const AUTOFORM_FIELD_INVALID_CLASS = "autoform-invalid";
const AUTOFORM_FORM_INVALID_CLASS = "autoform-form-invalid";
const AUTOFORM_SUBMIT_INVALID_CLASS = "autoform-submit-invalid";
const AUTOFORM_HOVERED_ONCE = "autoform-submit-hovered-once";
const AUTOFORM_KEYERROR_WRAP_CLASS = "autoforms_errors";
const AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS = "autoforms_errors";
const HTML5_INPUT_TYPES = ["text", "password", "checkbox", "radio", "number", "color", "date", "datetime", "datetime-local", "email", "range", "search", "tel", "time", "url", "month", "week", "file"];

const E_VALIDATION = 100;
const E_EMPTY = 101;
const E_EMPTY_CHECKBOX = 102;
const DEFAULT_VALIDATORS = {
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
            const checkedVals = field.autoFormLink.nodeLink.querySelector(`input[name="${field.nodeLink.getAttribute("name")}"]:checked`);

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
    "file": {
        "keys": "",
        "errorMessage": "Please select file",
        "validatorFunction": function (field) {
            return !!field.nodeLink.value;
        }
    },
    "number": {
        "keys": "0123456789",
        "errorMessage": "Type only numbers",
        "validatorFunction": false,
        "keypressValidatorFunction": false
    }
};

class ErrorMessage {
    constructor(field) {
        if (!field.empty) {
            this.message = field.autoFormLink.options.validators[field.type].errorMessage + " " + (field.nodeLink.dataset.name || field.nodeLink.name);
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
        const instance = this;

        node.autoformField = instance;
        instance.nodeLink = node;
        instance.dataOpts = node.dataset;
        instance.type = instance.dataOpts.fieldType || (instance.nodeLink.attributes.type ? instance.nodeLink.attributes.type.value : "text");
        instance.empty = false;
        instance.valid = false;
        instance.autoFormLink = autoForm;
        instance.addFieldListeners();
    }

    /**
     * Method adds event listeners to field
     */
    addFieldListeners() {
        const currentField = this;

        let allowAllSymbols = false,
            checkString,
            additionalValidation = true;

        currentField.nodeLink.addEventListener("keyup", () => currentField.autoFormLink.updateState());
        currentField.nodeLink.addEventListener("change", () => currentField.autoFormLink.updateState());
        currentField.nodeLink.addEventListener("click", function () {
            currentField.autoFormLink.updateState();
            this.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
        });
        currentField.nodeLink.addEventListener("keypress", function (evt) {
            if ((evt.keyCode === 13) && (currentField.autoFormLink.submit.attributes.disabled !== "disabled") && (this.tagName !== "TEXTAREA")) {
                currentField.autoFormLink.submit.click();
            }

            if (currentField.autoFormLink.options.validators[currentField.type].keypressValidatorFunction) {
                additionalValidation = currentField.autoFormLink.options.validators[currentField.type].keypressValidatorFunction(currentField);
            }
            if (currentField.autoFormLink.options.validators[currentField.type].keys) {
                checkString = currentField.autoFormLink.options.validators[currentField.type].keys.split("").map(
                    function(char){
                        return char.charCodeAt();
                    }).join(" ") + " 8 9 10 13";
            } else {
                allowAllSymbols = true;
            }

            if (additionalValidation && (!allowAllSymbols) && (checkString.search(evt.which) === -1)) {
                evt.preventDefault();
                return false;
            }
        });

        if (currentField.autoFormLink.options.PositiveValidation) {
            currentField.nodeLink.addEventListener("focusout", function () {
                if (currentField.isValid()) {
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
     * Method isValids single field
     * @param callFromGroup if called from group validator
     * @returns {boolean|*}
     */
    isValid(callFromGroup) {
        const instance = this;

        instance.empty = instance.nodeLink.value === "";

        if (!instance.empty ) {
            if (instance.autoFormLink.options.validators[instance.type]) {
                if (instance.autoFormLink.options.validators[instance.type].validatorFunction) {
                    instance.valid = instance.autoFormLink.options.validators[instance.type].validatorFunction(instance);
                } else {
                    instance.valid = true;
                }
            } else {
                instance.valid = true;
            }
        }
        else {
            if ((instance.dataOpts.required !== true) && (instance.dataOpts.required !== undefined)) {
                instance.valid = true;
            }
            else {
                instance.autoFormLink.errorString = "Fill up required fields";
                instance.valid = false;
            }
        }
        if (instance.dataOpts.group && !callFromGroup) {
            instance.valid = instance.autoFormLink.isGroupValid(instance.dataOpts.group, instance.dataOpts.groupValidateOperator);
        }
        return instance.valid;
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
        const instance = this;

        instance.errorStack = {
            validationErrors: [],
            emptyErrors: [],
            emptyCheckboxes: []
        };
        instance.valid = false;
        instance.nodeLink = htmlElementNode;
        instance.options = instance.setDefaultOptions(options);

        instance.mergeValidators(options.validators);
        instance.initMutationObserver();
        instance.updateWatchedFieldsList();
    }

    setDefaultOptions(options) {
        return {
            validators: DEFAULT_VALIDATORS,
            ShowErrorMsg: options.ShowErrorMsg || false,
            PrettyPrintErrors: options.PrettyPrintErrors || true,
            EnableAnimations: options.EnableAnimations || true,
            DeactivateSubmit: options.DeactivateSubmit || true,
            FormInvalidClass: options.FormInvalidClass || true,
            CancelButton: options.CancelButton || ".cancel",
            CancelErrorMsg: options.CancelErrorMsg || false,
            PositiveValidation: options.PositiveValidation || true,
            LeaveUnvalidHighlights: options.LeaveUnvalidHighlights || false
        }
    }

    mergeValidators(validators) {
        const instance = this;

        for (const key in validators) {
            if (validators.hasOwnProperty(key)) {
                instance.options.validators[key] = validators[key];
            }
        }
    }

    initMutationObserver() {
        const instance = this;

        if (MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let update = false;

                mutations.forEach(function(mutation) {
                    if (mutation.type === "childList" && mutation.target.classList[0] !== AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS) {
                        update = true;
                    }
                });

                if (update) {
                    instance.updateWatchedFieldsList();
                }
            });

            observer.observe(instance.nodeLink, {
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
    addErrorToStack(error) {
        let addToStack = true;
        this.errorStack.emptyErrors.concat(
            this.errorStack.validationErrors.concat(this.errorStack.emptyCheckboxes)
        ).forEach(function(err) {
            if (error.message === err.message) {
                addToStack = false;
            }
        });

        if (addToStack) {
            switch (error.type) {
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
    clearErrorsStack() {
        this.errorStack.emptyErrors = [];
        this.errorStack.validationErrors = [];
        this.errorStack.emptyCheckboxes = [];
    }

    getSubmitButtonNode() {
        const instance = this;

        return instance.nodeLink.querySelector("input[type=\"submit\"]") ||
            instance.nodeLink.querySelector("button[type=\"submit\"]") ||
            document.querySelector(`input[form="${instance.nodeLink.id}"]`) ||
            document.querySelector(`button[form="${instance.nodeLink.id}"]`) ||
            instance.nodeLink.querySelector("button")
    }

    /**
     * updates fields list in object (you can call this method to update fields if form changed)
     */
    updateWatchedFieldsList() {
        const instance = this;

        instance.submit = instance.getSubmitButtonNode();
        instance.fields = [];
        const thisNodeId = instance.nodeLink.id;
        const fields = instance.nodeLink.querySelectorAll(
            (HTML5_INPUT_TYPES.map(function (fieldTypeHTML) {
                return `input[type="${fieldTypeHTML}"], input[type="${fieldTypeHTML}"][form="${thisNodeId}"]`;
            }).join(", ")) +
            ", select, " +
            "textarea, " +
            `select[form="${this.nodeLink.id}"]`);

        for (const field of fields) {
            instance.fields.push(new Field(field, instance));
        }
    }

    /**
     * returns array of fields filtered by group
     * @param groupName
     * @returns {Array.<*>}
     */
    getFieldsByGroup(groupName) {
        const instance = this;

        return instance.fields.filter(function (field) {
            return field.dataOpts.group === groupName;
        });
    }

    /**
     * Validate fields grouped by data-group attribute
     * @param groupName
     * @param operator validation operator (currently "or" or "and")
     * @returns {boolean}
     */
    isGroupValid(groupName, operator) {
        const instance = this;
        const fields = instance.getFieldsByGroup(groupName);
        let groupValid = false;
        
        switch (operator) {
            case "or": {
                fields.forEach(function (field) {
                    if (field.isValid(true)) {
                        groupValid = true;
                    }
                });
            } break;
            case "and": {
                groupValid = true;
                fields.forEach(function (field) {
                    if (!field.isValid(true)) {
                        groupValid = false;
                    }
                });
            } break;
            default: {
                groupValid = true;
                fields.forEach(function (field) {
                    if (!field.isValid(true)) {
                        groupValid = false;
                    }
                });
            } break;
        }

        return groupValid;
    }

    /**
     * Checks all fields of form. If at least one field is not valid (isValid() method returns false) returns false
     * @returns {boolean}
     */
    isValid() {
        const instance = this;
        
        instance.clearErrorsStack();
        instance.valid = true;

        for (const field of instance.fields) {
            if (!field.isValid()) {
                instance.valid = false;
                instance.addErrorToStack(new ErrorMessage(field));
            }
        }
        return instance.valid;
    };

    /**
     * This method run actions that changes form states
     */
    updateState() {
        const instance = this;

        if (instance.isValid()) {
            try {
                instance.nodeLink.querySelector(`.${AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS}`).innerHTML = "";
                if (instance.options.FormInvalidClass) {
                    instance.nodeLink.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
                }
                if (instance.options.DeactivateSubmit) {
                    instance.submit.parentElement.classList.remove(AUTOFORM_SUBMIT_INVALID_CLASS);
                    instance.submit.removeAttribute("disabled");
                }
            } catch (e) {
                console.error(`(Error) in autoforms: ${e.message}`);
            }
            return;
        }

        if (instance.options.PrettyPrintErrors) {
            try {
                instance.nodeLink.querySelector(`.${AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS}`).innerHTML =
                    `${(function () {
                        if (instance.errorStack.emptyErrors.length > 0) {
                            return `<div class="empty-errors">
                                            <div class="title">The following fields is empty:</div>
                                            <div class="error-list">
                                                ${instance.errorStack.emptyErrors.map(function (err) {
                                return `<span class="error-message">${err.field.dataOpts.name || err.field.nodeLink.name }</span>`;
                            }).join("")}
                                            </div>
                                         </div>`;
                        } else {
                            return "";
                        }
                    })()}
                    ${(function () {
                        if (instance.errorStack.validationErrors.length > 0) {
                            return `<div class="validation-errors">
                                        <div class="title">Check the correctness of the fields:</div>
                                        <div class="error-list">
                                            ${instance.errorStack.validationErrors.map(function (err) {
                                return `<span class="error-message">${err.field.dataOpts.name || err.field.nodeLink.name}</span>`;
                            }).join("")}
                                        </div>
                                     </div>`;
                        } else {
                            return "";
                        }
                    })()}
                    ${(function () {
                        if (instance.errorStack.emptyCheckboxes.length > 0) {
                            return `<div class="empty-checkboxes-errors">
                                        <div class="title">Check the checkboxes:</div>
                                        <div class="error-list">
                                            ${instance.errorStack.emptyCheckboxes.map(function (err) {
                                return `<span class="error-message">${err.field.dataOpts.name || err.field.nodeLink.name}</span>`;
                            }).join("")}
                                        </div>
                                     </div>`;
                        } else {
                            return "";
                        }
                    })()}`;
            } catch (e) {
                console.error(`(Error) in autoforms: ${e.message}`);
            }
        } else {
            try {
                instance.nodeLink.querySelector(`.${AUTOFORM_VALIDATE_ERRORS_WRAP_CLASS}`).innerHTML = instance.errorStack.emptyErrors.concat(instance.errorStack.validationErrors.concat(instance.errorStack.emptyCheckboxes)).map(function (err) {
                    return `<span class="error-message">${err.message}</span><br>`;
                }).join("");
            } catch (e) {
                console.error(`(Error) in autoforms: ${e.message}`);
            }
        }
        if (instance.options.FormInvalidClass) {
            instance.nodeLink.classList.add(AUTOFORM_FORM_INVALID_CLASS);
        }
        if (instance.options.DeactivateSubmit) {
            instance.submit.parentElement.classList.add(AUTOFORM_SUBMIT_INVALID_CLASS);
            instance.submit.setAttribute("disabled", "disabled");
        }
    }

    /**
     * This method inits all events of form including field events and submit hover events
     */
    initEvents() {
        const instance = this;

        instance.submit.parentNode.addEventListener("mouseenter", function () {
            instance.highlightInvalidFields("on");
            if (!instance.nodeLink.classList.contains(AUTOFORM_HOVERED_ONCE)) {
                instance.nodeLink.classList.add(AUTOFORM_HOVERED_ONCE);
            }
        });
        instance.submit.parentNode.addEventListener("mouseleave", function () {
            if (!instance.options.LeaveUnvalidHighlights) {
                instance.highlightInvalidFields("off");
            }
            if (instance.options.ShowErrorMsg) {
                if (instance.options.EnableAnimations) {
                    instance.nodeLink.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).style.opacity = 0;
                }
                else {
                    instance.nodeLink.getElementById(AUTOFORM_KEYERROR_WRAP_CLASS).innerHTML = "";
                }

            }
        });


        if (instance.valid) {
            if (instance.options.FormInvalidClass) {
                instance.nodeLink.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (instance.options.DeactivateSubmit) {
                instance.submit.parentNode.classList.remove(AUTOFORM_SUBMIT_INVALID_CLASS);
                if (instance.submit.attributes.disabled) {
                    instance.submit.removeAttribute("disabled");
                }

            }
        }
        else {
            if (instance.options.FormInvalidClass) {
                instance.nodeLink.classList.remove(AUTOFORM_FORM_INVALID_CLASS);
            }
            if (instance.options.DeactivateSubmit) {
                instance.submit.parentNode.classList.add(AUTOFORM_SUBMIT_INVALID_CLASS);
                instance.submit.setAttribute("disabled", "disabled");
            }
        }

        if (instance.options.CancelErrorMsg) {
            document.querySelector(instance.options.CancelButton).addEventListener("mouseenter", function () {
                instance.errorString = "Будут отменены все изменения!";
            });
            document.querySelector(instance.options.CancelButton).addEventListener("mouseleave", function () {
                instance.errorString = "";
                if (instance.options.EnableAnimations) {
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
        const instance = this;

        for (const field of instance.fields) {
            if (opts !== "off") {
                if (field.isValid()) {
                    field.nodeLink.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
                } else {
                    field.nodeLink.classList.add(AUTOFORM_FIELD_INVALID_CLASS);
                }
            }

            if (opts === "off") {
                field.nodeLink.classList.remove(AUTOFORM_FIELD_INVALID_CLASS);
            }
        }
    };
}

const autoforms = {
    widgets: {}, // all widgets with inited autoform
    init: function (htmlElementNode, options) {
        if (htmlElementNode) {
            const aufm = this;

            const newElementName = (htmlElementNode.className + htmlElementNode.id).toLowerCase().replace(new RegExp("[^[a-zA-Z0-9]]*", "g"), "_");

            if (!options) {
                options = {};
            }

            const newAufmWidget = htmlElementNode.autoform = aufm.widgets[newElementName] = new AutoForm(htmlElementNode, options);
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
