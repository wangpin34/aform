var name = 'aform';
var aform;
if (window) {
    window[name] = aform = new Object();
} else {
    aform = new Object;
}

//utils function
aform.utils = {
    //Clone object
    clone: function clone(obj) {
        var copy = {};
        for (var i in obj) {
            if (typeof obj[i] !== 'object') {
                copy[i] = obj[i];
            } else {
                copy[i] = clone(obj[i]);
            }
        }
        return copy;
    }
};


//Init the function named define
//@fields [Object] fields define
aform.define = function define(fields) {

    var form = {};
    //build form constraint
    var constraint = form.constraint = aform.utils.clone(fields);

    //scan each rules on html like disabled,maxLength,readOnly, and add them into models
    form.scan = function(formDom) {

        var formFields = {},
            props = {},
            elements = formDom.elements,
            formData = [];

        var genProp = function(name, element) {
            return {
                get: function() {
                    return this['_' + name];
                },
                set: function(newVal) {
                    //Check constraints
                    if (constraint[name]) {
                        if (constraint[name].maxLength && newVal.length > constraint[name].maxLength) {
                            throw 'Its length should less than ' + constraint[name].maxLength;
                        }
                        if (constraint[name].required && newVal.length === 0) {
                            throw 'It is required';
                        }
                        if (constraint[name].validate && (!constraint[name].validate(newVal))) {
                            throw 'It is not meet the expection';
                        }
                    }
                    this['_' + name] = newVal;
                    element.value = newVal;
                }
            }
        };

        for (var i = 0; i < formDom.length; i++) {
            var maxLength = parseInt(elements[i].getAttribute('maxLength')) || -1;
            if (constraint[elements[i].name] || (constraint[elements[i].name] = {})) {
                if (maxLength > 0) {
                    constraint[elements[i].name].maxLength = maxLength;
                }
            }

            //copy each value of form
            formData.push({
                name: elements[i].name,
                value: elements[i].value
            });
            props[elements[i].name] = genProp(elements[i].name, elements[i]);

            elements[i].addEventListener('keyup', function(event) {
                var newValue = event.target.value;
                if (formFields[event.target.name] != newValue) {
                    formFields[event.target.name] = newValue;
                }
            });
        }

        Object.defineProperties(formFields, props);

        formData.forEach(function(e) {
            formFields[e.name] = e.value;
        });

        form.fields = formFields;
    };

    return form;
};
