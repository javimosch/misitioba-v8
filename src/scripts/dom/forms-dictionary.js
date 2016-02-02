var forms = require('./forms');


forms.type('dictionary',(field)=>{
	var el = _.dom('output');
	var frm = forms({
		name: 'form-dictionary-' + new Date().getTime(),
		target:el,
		fields:{
			0:{
				label:'Key/Value',
				type:'keyvalue'
			}
		}
	}).attach();
	field.val = (index,k,v)=>{
		frm.fields[index].val();
	};
	field.clear = (index)=>{
		frm.fields[index].clear();	
	};
	field.template = ""
	+"<label data-label></label>"
	+"<div data-view></div>"
	+"<button class='add'>add</button>"
	+""
	;
	return el;
});

forms.type('keyvalue',(field)=>{
	var el = _.dom('output');
	var frm = forms({
		name:'form-keyvalue-'+ new Date().getTime(),
		target:el,
		fields:{
			key:{
				label:'Key',
				template:"<div data-view></div>"
			},
			value:{
				label:'Value',
				template:"<div data-view></div>"
			}
		}
	}).attach();
	field.val = (k,v)=>{
		frm.fields.key.el.val(k);
		frm.fields.value.el.val(v);
	};
	field.clear = ()=>{
		frm.fields.key.el.val('');
		frm.fields.value.el.val('');	
	};
	return el;
});
/*
forms.type({
	type: "dictionary",
	template: "<label><span data-label></span>(key/value)</label><ul><output></output></ul>"
	+"<button class='add'>add</button>",
	events: {
		"form-show": (self) => {
			self.el('.add').onclick = (e) => {
				console.log('addd!');
				e.preventDefault();
			};
		}
	},
	create: function (field) {
		var wrapper = _.dom('output');
		wrapper.innerHTML = field.template;
		forms({
			target: wrapper.el('output'),
			fields: {
				property_0: {
					label: 'Property',
					type:'property'
				}
			}
		}).show();
		return wrapper;
	}
});

forms.type({
	type: "property",
	template: "",
	create: function (self) {
		var wrapper = _.dom('output').html(self.template).cls({
			box: true
		});
		forms({
			target: wrapper,
			template: "<li><output></output></li>",
			fields: {
				key: {
					label: 'Key',
					template: "<label data-label></label><input class='key' style='width:60px;'/>",
					attributes: {
						placeholder: 'key'
					}
				},
				value: {
					label: 'Value',
					template: "<label data-label></label><input class='value' style='width:80px;'/>",
					attributes: {
						placeholder: 'value'
					}
				}
			}
		}).show();
		return wrapper;
	}
});

*/