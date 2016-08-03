# AUTOFORMS.js

AMD/CommonJS module designed to automatically validate the form when you hover on submit associated with this form
For proper operation of the script, you need to add the type of validation attribute 'data-field-type' to fields.
Optional fields are marked with attribute `data-required = 'false'.`

## Usage

### CommonJS
  
`autoforms = require("./autoforms");`
`autoforms.init( htmlObject, options )`

### AMD

`requirejs(["autoforms"], function(autoforms){`
` \\code here`
`})`
 
**valid values for data-field-type:**
  
`text-all` - validate any text
`text-url` - validate only latin symbols
`date` - validate only numbers and separators
`phone` - validate only numbers
`radio` - validate only if one of radios in group is selected
`e-mail` - validate only if input value contains @ and . symbols
`checkbox` - validate only if checked
 