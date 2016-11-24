"use strict";

window.onload = function () {
    var forms = document.getElementsByClassName("au-block_form");

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = forms[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var form = _step.value;

            autoforms.init(form, {
                Validators: {
                    "maskphone": {
                        "keys": "()+-0123456789()-",
                        "errorMessage": "Type only numbers",
                        "validatorFunction": function validatorFunction(field) {
                            return field.valid = field.nodeLink.value.indexOf("_") < 0;
                        },
                        "keypressValidatorFunction": false
                    }
                }
            });
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
};