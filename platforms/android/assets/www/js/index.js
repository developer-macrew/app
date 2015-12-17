//==== PHONEGAP FUNCTIONALITY ====
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	window.sa = new sa();
    	
    	// get fallbacks for js functions
    	if (typeof atob == "undefined")
    		$.getScript("js/base64.min.js");
    }
};

// ==== SA APP INSTANCE ====
function sa(){
	this.app_url = 'http://localhost/shevet_ahim/backend/htdocs/api.php';
	this.signed_up = null;
	this.session_id = null;
	this.session_key = null;
	this.session_status = null;
	this.hebdate = null;
	this.position = null;
	this.requests = {};
	
	this.init();
}

sa.prototype.init = function(){
	// get current position
	var self = this;
	navigator.geolocation.getCurrentPosition(function(position){
		self.setProp('position',position);
	});
		
	// initialize hebdate object and set position (default Panama City)
	this.hebdate = new Hebcal.HDate();
	if (this.position)
		this.hebdate.setLocation(this.position.coords.latitude, this.position.coords.longitude);
	else
		this.hebdate.setLocation(8.97,-79.51);

	// try to get phone number and email
	/*
	var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
	deviceInfo.get(function(result) {
        console.log(result);
    });
    */
	
	// subscribe ui functionality
	$('#sa-signup').click(function(e) {
		self.signup(this);
		e.preventDefault();
	});
	$('#sa-login').click(function(e) {
		self.login(this);
		e.preventDefault();
	});
	$('.sa-close-popup').click(function(e){
		$(this).parents('.popup-full').find('.sa-items').html('');
	});
	$('#sa-form-errors').popup();
	$("#sa-form-errors .errors").listview();
	$("#sa-menu").panel().on("panelbeforeopen",function(e,ui) {
		$('.blur-copy > .contain').html($('.ui-page-active').html()).width($('.ui-page-active').width()).scrollTop($('.ui-page-active').scrollTop()).foggy({
			blurRadius: 2,
			cssFilterSupport: true,
			opacity: 1,
		}).children('.ui-header,.ui-content').width($('.ui-page-active').width());
		$('.blur-copy .ui-content').css('margin-top',(parseFloat($('.blur-copy .ui-content').position().top) + parseFloat($('.ui-page-active').css('padding-top')) + 'px'));
		$('.blur-copy .ui-header').css('top','0');
	}).on("panelopen",function(e,ui) {
		$('.blur-copy').fadeIn(200);
		
	}).on("panelbeforeclose",function(e,ui) {
		$('.blur-copy').hide(0);
	});
	
	setTimeout(function(){
		$('#sa-hebdate-date').html(self.hebdate.toString());
	},3000);
	
	// get stored session
	this.signed_up = this.getItem('sa-signed-up');
	this.session_id = this.getItem('sa-session-id');
	this.session_key = this.getItem('sa-session-key');
	this.session_status = this.getItem('sa-session-status');
	
	// initialize appropriate state
	if (this.session_id && this.session_key && this.session_status == 'approved')
		$.mobile.navigate("#news-feed");
	if (this.session_id && this.session_key && this.session_status == 'pending')
		$.mobile.navigate("#signup-waiting");
	if (this.session_id && this.session_key && this.session_status == 'rejected')
		$.mobile.navigate("#signup-rejected");
}

sa.prototype.signup = function(button){
	var self = this;
	var form = $(button).parents('form').serializeArray();
	var info = this.condenseForm(form);
	
	this.addRequest('User','signup',[info]);
	this.sendRequests(function(result){
		if (typeof result.User.signup.results[0] != 'undefined') {
			if (typeof result.User.signup.results[0].errors != 'undefined') {
				var errors = result.User.signup.results[0].errors;
				var error_fields = result.User.signup.results[0].error_fields;
				self.displayErrors(errors,error_fields,button);
			}
			else if (result.User.signup.results[0]) {
				if (result.User.signup.results[0] == 'pending')
					$.mobile.navigate("#signup-waiting");
				if (result.User.signup.results[0] == 'approved')
					self.login(null,info);
				
				self.setItem('sa-signed-up',true);
			}
		}
		else
			self.displayErrors(['Problema de conexión!']);
	});
}

sa.prototype.login = function(button,info){
	var self = this;
	if (!info)
		info = this.condenseForm($(button).parents('form').serializeArray());
	else
		button = $('#sa-login');
	
	this.addRequest('User','login',[info]);
	this.sendRequests(function(result){
		if (typeof result.User.login.results[0] != 'undefined') {
			if (typeof result.User.login.results[0].errors != 'undefined') {
				var errors = result.User.login.results[0].errors;
				var error_fields = result.User.login.results[0].error_fields;
				self.displayErrors(errors,error_fields,button);
			}
			else if (result.User.login.results[0]) {
				this.session_id = result.User.login.results[0].session_id;
				this.session_key = result.User.login.results[0].session_key;
				this.session_status = result.User.login.results[0].status;
				self.setItem('sa-session-id',result.User.login.results[0].session_id);
				self.setItem('sa-session-key',result.User.login.results[0].session_key);
				self.setItem('sa-session-status',result.User.login.results[0].status);
				self.setItem('sa-signed-up',true);
				
				if (this.session_status == 'approved') {
					$.mobile.navigate("#news-feed");
				}
				else if (this.session_status == 'pending') {
					$.mobile.navigate("#signup-waiting");
				}
				else if (this.session_status == 'rejected') {
					$.mobile.navigate("#signup-rejected");
				}
			}
		}
		else
			self.displayErrors(['Problema de conexión!']);
	});
}

//==== SA APP UTILITIES ====
sa.prototype.addRequest = function (classname,method,params) {
	var methods = {};
	methods[method] = params;
	
	if (!this.requests[classname])
		this.requests[classname] = [];
	
	this.requests[classname].push(methods);
}

sa.prototype.sendRequests = function (callback) {
	var params = {};
	params.commands = JSON.stringify(this.requests);
	if (this.session_id && this.session_key) {
		params.session_id = this.session_id;
		params.nonce = moment().utc();
		params.signature = CryptoJS.HmacSHA256(atob(params.commands),this.session_key);
	}
	
	$.post(this.app_url,params,function(data) {
		if (!data || data.search('<') >= 0)
			callback({});
		else
			callback(JSON.parse(data));
	});
	
	this.requests = {};
}

sa.prototype.setProp = function (prop,val) {
	this[prop] = val;
}

sa.prototype.condenseForm = function (form) {
	var form_values = {};
	if (form && form.length > 0) {
		for (i in form) {
			form_values[form[i].name] = form[i].value;
		}
	}
	return form_values;
}

sa.prototype.displayErrors = function (errors,error_fields,button) {
	if (error_fields && button) {
		for (i in error_fields) {
			$(button).parents('form').find('#' + error_fields[i]).parents('.param').addClass('error');
		}
	}
	
	for (i in errors) {
		$('#sa-form-errors .errors').append('<li>' + errors[i] + '</li>');
	}
	
	$("#sa-form-errors .errors").listview("refresh");
	$('#sa-form-errors').popup('open');
}

sa.prototype.getItem = function (key) {
	var item = window.localStorage.getItem(key);
	if (!this.isJSON(item))
		return null;
	
	return JSON.parse(item);
}

sa.prototype.setItem = function (key,value) {
	try {
		window.localStorage.setItem(key,JSON.stringify(value));
		return true;
	} 
	catch (e) {
		return false;
	}
}

sa.prototype.removeItem = function (key) {
	try {
		window.localStorage.removeItem(key);
		return true;
	} 
	catch (e) {
		return false;
	}
}

sa.prototype.isJSON = function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
