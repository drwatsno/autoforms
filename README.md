# AUTOFORMS.js

AMD/CommonJS module designed to automatically validate the form when you hover on submit associated with this form
Non-required fields are marked with attribute `data-required = 'false'.`

## Usage

### CommonJS
  
`autoforms = require("./autoforms");`
`autoforms.init( htmlObject, options )`

### AMD

`requirejs(["autoforms"], function(autoforms){`
` \\code here`
`})`
 
**valid values for data-field-type:**
  
`text` - validate any text
`url` - validate only latin symbols
`date` - validate only numbers and separators
`phone` - validate only numbers
`radio` - validate only if one of radios in group is selected
`e-mail` - validate only if input value looks like email
`checkbox` - validate only if checked
 
**if data-field-type is not set autoforms looks to the 'type' attribut of input to apply correct validator** 