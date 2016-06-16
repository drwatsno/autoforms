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

    Field.prototype.isValid = function () {
        this.empty = this.node.value === "";
        if (!this.empty ) { // если поле не пустое
            switch (this.data.fieldType) { // начинаем валидацию
                case "text-all": this.valid = true; break; // любой текст
                case "text-url": this.valid = true; break; // аналогично верхнему
                case "date": this.valid = true; break;
                case "phone": this.valid = true; break;
                case "maskphone": this.valid = this.node.value.indexOf("_")<0; break;
                case "radio": this.valid = thisAutoform.querySelector("input[name='"+this.node.getAttribute("name")+"']:checked").value != undefined||(!this.data.required); break;
                case "email":  // в e-mail проверяем наличие символов @ и точки
                    this.valid = ((String(this.node.value).indexOf("@") > -1) && (String(this.node.value).indexOf(".") > -1));
                    if (!this.valid) { thisAutoform.errorString = "Неправильный email"; }
                    break;
                case "checkbox":
                    this.valid = true; break;
                case "number": this.valid = true; break;
            }
            if (this.data.crossValid) {
                if (document.querySelector("#"+this.data.crossValid).value !== "") this.valid = true;
            }
            // после валидации возвращаем значение valid. Соответственно если валидация не прошла
            // или тип валидации не установлен вернется valid = false
            return this.valid;
        }
        else {
            // если поле пустое
            if ((this.data.required !== true)&&(this.data.required !== undefined)) {
                // но не обязательное
                this.valid = true;
                // пропускаем его
                return this.valid;
            }
            else {
                //   console.log(this);
                // но если всё же обязательное
                thisAutoform.errorString = "Незаполнены обязательные поля";
                // отмечаем как не валидное и устанавливаем строку ошибки
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
    this.node = htmlElementNode;
    this.submit = this.node.querySelector('input[type="submit"]').length < 1?document.querySelector('input[form="' + this.node.id + '"]'):this.node.querySelector('input[type="submit"]');
    this.fields = [];
    var fields = this.node.querySelectorAll('input[type="text"], input[type="password"], input[type="checkbox"], input[type="radio"], select, textarea input[type="text"][form="' + this.node.id + '"], select[form="' + this.node.id + '"], input[type="radio"][form="' + this.node.id + '"]');
    for (var i=0; i< fields.length; i++) {
        this.fields.push(new Field(fields[i]));
    }
    this.errorString = "";
};


window.autoform = {
    widgets: {}, // all widgets with inited autoform
    init: function (htmlElementNode, options) {
        var aufm = this,

            newElementName = (htmlElementNode.className+htmlElementNode.id).toLowerCase().replace(new RegExp("[^[a-zA-Z0-9]]*","g"),'_');

        if (!options) options = {};

        var newAufmWidget = aufm.widgets[newElementName] = new AutoForm(htmlElementNode, options);

    }
};