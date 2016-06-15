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

window.autoform = {
    widgets: {}, // all widgets with inited autoform
    init: function (htmlElementNode, options) {
        var opts = {
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
        console.log(htmlElementNode);
    }
};