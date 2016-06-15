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
 For proper operation of the script fields of the form you need to add the type of validation that is transmitted through the attribute
 data-field-type. Optional fields are marked attribute data-required = 'false'.

 *
 *  Usage: $("#formId").autoform({[options]});
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
 *  NOTE: This is an old version of script. I used it with jquery and i'm not planning to support it, i think...
 *  */

$.fn.autoform = function (options) {
    "use strict";
    var opts = $.extend({}, $.fn.autoform.defaults, options);
    $.each(this, function () {
        var autoform = $(this),
            autoform_id = autoform.attr("id"),
            autoformSubmitButton = function () {
                // проверяем наличия сабмита в форме и если не находим возвращаем сабмит в котором в качестве формы указана целевая
                if (autoform.find('input[type="submit"]').length < 1) {
                    return $('input[form="' + autoform_id + '"]');
                } else {
                    return autoform.find('input[type="submit"]');
                }
            },
            autoformInputs = autoform.find('input[type="text"]').add(autoform.find('input[type="password"]')).add(autoform.find('input[type="checkbox"]')).add(autoform.find('input[type="radio"]')).add(autoform.find('select')).add(autoform.find('textarea')).add($('input[type="text"][form="' + autoform_id + '"]')).add($('select[form="' + autoform_id + '"]')).add($('input[type="radio"][form="' + autoform_id + '"]')),
        // берем все HTML4 типы инпутов кроме submit включая те что вне формы
            errorString = "";

        function fieldValid(field) {
            // Валидация поля переданного в field
            var fieldType = field.data("field-type"), // Получам тип валидации поля
                crossValid = field.data("crossvalid")||false,
                empty = false,                         // По умолчанию считаем поле не пустым
                valid = false;                         // и не валидным

            empty = field.val() === "";

            if (!empty) { // если поле не пустое
                switch (fieldType) { // начинаем валидацию
                    case "text-all": valid = true; break; // любой текст
                    case "text-url": valid = true; break; // аналогично верхнему
                    case "date": valid = true; break;
                    case "phone": valid = true; break;
                    case "maskphone": valid = field.val().indexOf("_")<0; break;
                    case "radio": valid = autoform.find("input[name='"+field.attr("name")+"']:checked").val() != undefined||(!field.data("required")); break;
                    case "email":  // в e-mail проверяем наличие символов @ и точки
                        valid = ((String(field.val()).indexOf("@") > -1) && (String(field.val()).indexOf(".") > -1));
                        if (!valid) { errorString = "Неправильный email"; }
                        break;
                    case "checkbox":
                        valid = true; break;
                    case "number": valid = true; break;
                }
                if (crossValid) {
                    if ($("#"+crossValid).val() !== "") valid = true;
                }
                // после валидации возвращаем значение valid. Соответственно если валидация не прошла
                // или тип валидации не установлен вернется valid = false
                return valid;
            }
            else {
                // если поле пустое
                if ((field.data("required") !== true)&&(field.data("required") !== undefined)) {
                    // но не обязательное
                    valid = true;
                    // пропускаем его
                    return valid;
                }
                else {
                    //   console.log(this);
                    // но если всё же обязательное
                    errorString = "Незаполнены обязательные поля";
                    // отмечаем как не валидное и устанавливаем строку ошибки
                    valid = false;
                    if (crossValid) {
                        if ($("#"+crossValid).val() !== "") valid = true;
                    }
                    return valid;
                }
            }
        }

        // Функция навещивает на поля в fields события

        function fieldsValidateEventsOn(fields) {
            $.each(fields, function () {
                var currentField = $(this),
                    currentFieldType = currentField.data("field-type"),
                    noLimit = false,
                    checkString,
                    keyErrWrap,
                    additionalValidation = true;
                function validateCheckEventsRun() {
                    if (autoformValid()) {
                        if (opts.FormInvalidClass) {
                            autoform.removeClass("autoform-form-invalid");
                        }
                        if (opts.DeactivateSubmit) {
                            autoformSubmitButton().parent("div").removeClass("autoform-submit-invalid");
                            autoformSubmitButton().removeAttr("disabled");
                        }
                    }
                    else {
                        if (opts.FormInvalidClass) {
                            autoform.addClass("autoform-form-invalid");
                        }
                        if (opts.DeactivateSubmit) {
                            autoformSubmitButton().parent("div").addClass("autoform-submit-invalid");
                            autoformSubmitButton().attr("disabled", "disabled");
                        }
                    }
                }
                currentField.on("keyup", function () {
                    validateCheckEventsRun();
                });
                currentField.on("change", function () {
                    validateCheckEventsRun();
                });
                currentField.on("click", function () {
                    validateCheckEventsRun();
                    $(opts.ErrorMsgContainer).html("");
                    $(this).removeClass("autoform-invalid");
                });
                currentField.on("keypress", function (evt) {
                    var invalidKeyErrorMsg = "Недопустимый символ";
                    if (evt.keyCode === 13) {
                        if ((autoformSubmitButton().attr('disabled') !== 'disabled')&&(currentField.prop("tagName")!=="TEXTAREA")) {
                            autoformSubmitButton().click();
                        }
                    }

                    switch (currentFieldType) {
                        case "text-all": noLimit = true; break;
                        case "checkbox": noLimit = true; break;
                        case "text-url": checkString = "13 49 50 51 52 53 54 55 56 57 48 45 61 95 43 113 119 101 114 116 121 117 105 111 112 91 93 97 115 100 102 103 104 106 107 108 59 39 122 120 99 118 98 110 109 44 46 47 81 87 69 82 84 89 85 73 79 80 123 125 124 65 83 68 70 71 72 74 75 76 58 90 88 67 86 66 78 77 60 62 63";
                            invalidKeyErrorMsg = "Используйте только латинницу";
                            break;
                        case "date":     checkString = "13 47 46 49 50 51 52 53 54 55 56 57 48";
                            additionalValidation = (currentField.val().length < 10);
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
                        if (opts.InvalidKeyErrorMsg) {
                            if (currentField.data("keyerrwrapid")) {
                                keyErrWrap = $("#" + currentField.data("keyerrwrapid"));
                            } else {
                                keyErrWrap = $("#autoforms_errors");
                                if (keyErrWrap.length < 1) {
                                    $('<div id="autoforms_errors" style="opacity: 0"></div>').appendTo($(opts.ErrorMsgContainer));
                                    keyErrWrap = $("#autoforms_errors");
                                }
                            }
                            console.log(keyErrWrap);

                            keyErrWrap.css("opacity", "1");
                            if (keyErrWrap.find(".keyerr").length < 1) {
                                $('<span class="keyerr" style="opacity: 1">' + invalidKeyErrorMsg + '</span>').appendTo(keyErrWrap);
                                setTimeout(function () {
                                    keyErrWrap.find(".keyerr").animate({opacity: 0}, function () {
                                        $(this).remove();
                                    });
                                }, 900);
                            }

                        }
                        return false;
                    } else {
                        if (opts.InvalidKeyErrorMsg) {
                            $("#autoforms_errors").find(".keyerr").animate({opacity: 0},200, function () {
                                $(this).remove();
                            });
                        }
                    }
                });

                if (opts.PositiveValidation) {
                    currentField.on("focusout", function(){
                        if (fieldValid(currentField)) {
                            currentField.addClass("valid");
                        }
                    });
                    currentField.on("focusin", function(){
                        currentField.removeClass("valid");
                    });
                }
            });
        }

        function highlightInvalidFields(opts) {
            $.each(autoformInputs, function () {
                var currentInput = $(this);
                if (opts !== "off") {
                    if (fieldValid(currentInput)) {
                        currentInput.removeClass("autoform-invalid");
                    }
                    else {
                        currentInput.addClass("autoform-invalid");
                    }
                }

                if (opts === "off") {
                    currentInput.removeClass("autoform-invalid");
                }
            });
        }

        function autoformValid() {
            var valid = true;
            $.each(autoformInputs, function () {
                var currentInput = $(this);

                if (fieldValid(currentInput)) {
                }
                else {
                    valid = false;
                }
            });
            return valid;
        }

        fieldsValidateEventsOn(autoformInputs);
        autoformSubmitButton().parent("div").on("mouseenter", function () {
            highlightInvalidFields("on");
            if (autoformValid()) {
            }
            else {
                if (opts.ShowErrorMsg) {
                    if ($("#autoforms_errors").length < 1) {
                        $('<div id="autoforms_errors" style="opacity: 0"></div>').appendTo($(opts.ErrorMsgContainer));
                    }
                    if (opts.EnableAnimations) {
                        $("#autoforms_errors").html("<span>"+errorString+"</span>").animate({opacity: 1}, 100);
                    }
                    else {
                        $("#autoforms_errors").html("<span>"+errorString+"</span>");
                    }
                }
            }
        });
        autoformSubmitButton().parent("div").on("mouseleave", function () {
            highlightInvalidFields("off");
            if (autoformValid()) {
            }
            if (opts.ShowErrorMsg) {
                if (opts.EnableAnimations) {
                    $("#autoforms_errors").animate({opacity: 0}, 100, function () {
                        $(this).html("");
                    });
                }
                else {
                    $("#autoforms_errors").html("");
                }

            }
        });
        //////////////////////
        if (autoformValid()) {
            if (opts.FormInvalidClass) {
                autoform.removeClass("autoform-form-invalid");
            }
            if (opts.DeactivateSubmit) {
                autoformSubmitButton().parent("div").removeClass("autoform-submit-invalid");
                autoformSubmitButton().removeAttr("disabled");
            }
        }
        else {
            if (opts.FormInvalidClass) {
                autoform.addClass("autoform-form-invalid");
            }
            if (opts.DeactivateSubmit) {
                autoformSubmitButton().parent("div").addClass("autoform-submit-invalid");
                autoformSubmitButton().attr("disabled", "disabled");
            }
        }
        if (opts.CancelErrorMsg) {
            $(opts.CancelButton).on("mouseenter", function () {
                errorString = "Будут отменены все изменения!";
                if ($("#autoforms_errors").length < 1) {
                    $('<div id="autoforms_errors" style="opacity: 0"></div>').appendTo($(opts.ErrorMsgContainer));
                }
                if (opts.EnableAnimations) {
                    $("#autoforms_errors").html("<span>"+errorString+"</span>").animate({opacity: 1}, 100);
                }
                else {
                    $("#autoforms_errors").html("<span>"+errorString+"</span>");
                }
            });
            $(opts.CancelButton).on("mouseleave", function () {
                errorString = "";
                if (opts.EnableAnimations) {
                    $("#autoforms_errors").animate({opacity: 0}, 100, function () {
                        $(this).html("");
                    });
                }
                else {
                    $("#autoforms_errors").html("");
                }
            });
        }
    });

};
$.fn.autoform.defaults = {
    ShowErrorMsg       : false,                    // Отображать сообщения об ошибке
    ErrorMsgContainer  : ".autoforms-errors",      // Блок для вывода сообщений об ошибках
    EnableAnimations   : true,
    DeactivateSubmit   : true,
    FormInvalidClass   : true,
    InvalidKeyErrorMsg : true,
    InvalidKeyTimeout  : 1000,
    CancelButton       : ".cancel",
    CancelErrorMsg     : false,
    PositiveValidation : true
};