window.onload = function () {
  var forms = document.getElementsByClassName("au-block_form");

  for (var i=0;i<forms.length;i++) {
    autoform.init(forms[i]);
  }
};