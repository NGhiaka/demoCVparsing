/**
 * @fileOverview daxtra_cvx, connectivity to Daxtra resume parser
 * @author <a href="mailto:support@daxtra.com">Daxtra Support</a>
 * @version 1.6
 * @requires 
 * @license Daxtra | GPL | Apache 2.0, see LICENSE.txt
 * @see http://cvx.daxtra.com/cvx
 */
{
"use strict";

var daxtra_cvx = {

last_error:{code:0, message:"", source:""},
profile_json: {},
account: "",
cvx_server:"",
api_calls: {},

init: function(cvx_server, account) 
{
  daxtra_cvx.resetError();

  daxtra_cvx.cvx_server=cvx_server;
  daxtra_cvx.account=account;

  daxtra_cvx.api_calls =  {
    api_call_cvx:{api_call: "profile/full/json",
                  handler: daxtra_cvx._handler_cvx_return
              },
    api_call_cvx_phase1:{api_call: "profile/personal/json",
                  handler: daxtra_cvx._handler_cvx_return_phase1
              },
    api_call_cvx_phase2:{api_call: "data",
                  handler: daxtra_cvx._handler_cvx_return
              },
  };

  return;
},

getLastError: function() {
  return daxtra_cvx.last_error.code;
},
getLastErrorDescription: function() {
  return daxtra_cvx.last_error.message;
},
getLastErrorSource: function() {
  return daxtra_cvx.last_error.source;
},
resetError: function() {
  daxtra_cvx._set_error("", 0, "");
},

parse_cv_upload_file: function (upload_id, user_handler, params)
{
  daxtra_cvx._file_to_cvx(upload_id, user_handler, params, 
                          daxtra_cvx.api_calls.api_call_cvx); 
},

parse_cv_upload_file_split_phase: function (upload_id, user_handler, params)
{
  daxtra_cvx._file_to_cvx(upload_id, user_handler, params, 
                         daxtra_cvx.api_calls.api_call_cvx_phase1); 
},

_file_to_cvx: function (upload_id, user_handler, params, api_call_obj)
{
  daxtra_cvx.resetError();

  if(typeof(api_call_obj) == "undefined") {
     daxtra_cvx._set_error("daxtra_cvx has not been initialised. Call daxtra_cvx.init()", 9, "DCVX");
     return;
  }


  var file = daxtra_cvx._check_upload_field(upload_id);
  if(!file) return;

  if(!daxtra_cvx.account) {
     daxtra_cvx._set_error("No user account is set", 7, "DCVX");
     return;
  }
  //-- daxtra_cvx.cvx_server can be empty if to the same host as web server

  //-- pass full context of the call - might be useful
  var pass_params;
  if(params) { pass_params=params;}
  pass_params.action=api_call_obj.api_call;
  pass_params.account=daxtra_cvx.account;
  pass_params.cvx_server=daxtra_cvx.cvx_server

  var account_str = daxtra_cvx.account + '; -turbo';
  var xhr = daxtra_cvx._prepare_xhr(api_call_obj.handler, user_handler, pass_params);
  var full_url = daxtra_cvx._get_api_url(daxtra_cvx.cvx_server, api_call_obj.api_call);
  xhr.open("POST", full_url);
  //-- set data for post
  if(daxtra_cvx._supportFormData() && 0) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append("account", account_str);
    xhr.send(formData); 
    delete xhr;
  }
  else {
    var reader  = new FileReader();
    reader.onload = function(e) {
      var content = reader.result;
      content = content.replace(/^.*;base64,/, "");
      var jsonData = {account: account_str, file: content};
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify(jsonData));
      delete xhr;
    };
    reader.readAsDataURL(file);
  }
},




/*
<form id="the-form" 
      action="/cvx/rest/api/v1/profile/full/json" 
      enctype="multipart/form-data"
      onsubmit="return validateAndPostForm('the-form');"
>
  <input name="file" type="file">
  <input name="account" type="hidden" val="MYACCOUNT; -turbo" >
  <input name="action " type="hidden" val="ProcessCV_json" >
  <input type="submit" value="Upload" />
</form>
parse_upload_form: function(form_id, user_handler, params)
{
  var formElement = daxtra_cvx._get_el_by_id(form_id, "form");  
  if(!formElement) {
     return;
  }

  var formData = new FormData(formElement);
  var action = form.getAttribute('action');
  if(!action || !action/match(/\/cvx\/rest\/api\/)) {
     daxtra_cvx._set_error("No action on form", 4, "DCVX");
     return;
  }
   
  daxtra_cvx.cvx_server = action.replace(/\/cvx\/rest\/api\/.*$/);
  var api_call = action.replace(/^.*\/cvx\/rest\/api\/v1\//);

  var pass_params;
  if(params) { pass_params=params;}
  pass_params.action=api_call;
  pass_params.account=account;
  pass_params.cvx_server=daxtra_cvx.cvx_server;

  var handler = daxtra_cvx._handler_cvx_return;
  var xhr = daxtra_cvx._prepare_xhr(handler, user_handler, params);
  xhr.open("POST", action);
  xhr.send(formData);
},
*/


_prepare_xhr: function (handler, user_handler, params)
{
   var xhr = new XMLHttpRequest();
   xhr.onreadystatechange = function(e) {
     var resp_text; 
     if (xhr.readyState!=4) { return; }
     if (xhr.readyState==4 && xhr.status==200)
     {      
       handler(this.responseText, user_handler, params);
     }
     else {
       daxtra_cvx._set_error(xhr.statusText, xhr.status, "XHR");
       var ret_string;
       if(this.responseText.match(/^{/)) { //-- json generated by CVX
          ret_string = this.responseText;
       }
       else {
          ret_string = daxtra_cvx._error_to_json_string();
       }
       handler(ret_string, user_handler, params);
     }
   };
   xhr.onerror = function (e) {
      daxtra_cvx._set_error(e.target.statusText, e.target.status,  "XHR");
      handler( daxtra_cvx._error_to_json_string(), user_handler, params);
   }
   xhr.ontimeout = function() {
      daxtra_cvx._set_error("Timeout", 666, "XHR");
      handler( daxtra_cvx._error_to_json_string(), user_handler, params);
   }
   xhr.timeout = 30000; //-- 30 secs

   return xhr;
},

_handler_cvx_return: function(responseText, user_handler, params)
{
   if(responseText.match(/^{/)) 
   {
      try{
        var ret_json = JSON.parse(responseText);
        if(ret_json.CSERROR || ret_json.Resume) {
           daxtra_cvx.profile_json = ret_json;
        }
      }
      catch(e) {
          daxtra_cvx._set_error("Error at receiving json from server: " + e.message, e.code,  "XHR");
          daxtra_cvx.profile_json = JSON.parse(daxtra_cvx._error_to_json_string())
      }
   }
   if(!daxtra_cvx.profile_json){
      daxtra_cvx._set_error(responseText, 999,  "XHR"); 
      daxtra_cvx.profile_json = JSON.parse(daxtra_cvx._error_to_json_string());
   }
   if(user_handler) {
      params.last_error=daxtra_cvx.last_error;
      user_handler(daxtra_cvx.profile_json, params);
   } 
   return daxtra_cvx.profile_json;
},
_handler_cvx_return_phase1: function(responseText, user_handler, params)
{
   var profile_json = daxtra_cvx._handler_cvx_return(responseText, user_handler, params);

   daxtra_cvx.resetError();

   var api_call_obj = daxtra_cvx.api_calls.api_call_cvx_phase2;
   var phase2_token = (!profile_json.CSERROR) ? profile_json.full_profile_token : "";
   params.action = api_call_obj.api_call;

   if(phase2_token)
   {     
      var xhr = daxtra_cvx._prepare_xhr(api_call_obj.handler, user_handler, params);
      var full_url = daxtra_cvx._get_api_url(daxtra_cvx.cvx_server, api_call_obj.api_call);
      full_url += "?token=" + phase2_token;
      xhr.open("GET", full_url);
      xhr.send();
   }
   else {
      daxtra_cvx._set_error("Cannot execute phase2", 1729, "DCVX");
      if(user_handler) {
        var err_json = JSON.parse(daxtra_cvx._error_to_json_string());
        params.last_error=daxtra_cvx.last_error;
        user_handler(err_json, params);
      }
   }
   return profile_json;
},

_get_api_url: function(cvx_server, api_call) 
{
  if(cvx_server.match(/\/api\/v1\//)) {
     return cvx_server.replace(/\/api\/v1\/.*$/, api_call);
  }
  if(!cvx_server.match(/\/cvx\/rest\/api\/v1/)) 
     cvx_server += "/cvx/rest/api/v1/";
  cvx_server = cvx_server.replace(/[\/]$/, "");
  return cvx_server + "/" + api_call;
},

_check_upload_field: function(upload_id) 
{
  if(!daxtra_cvx._supportFileType()){
     daxtra_cvx._set_error("Your browser does not support file upload", 5, "DCVX");
     return;
  }
  var fileInput = daxtra_cvx._get_el_by_id(upload_id, "file");  
  if(!fileInput) {
      return;
  }
  var file = fileInput.files[0];
  if (typeof(file) == "undefined") {
     daxtra_cvx._set_error("File to upload has not been selected", 4, "DCVX");
     return;
  }
  return file;
},

_get_el_by_id: function (upload_id, el_type)
{
  if(!upload_id) {
     daxtra_cvx._set_error("No file element id supplied", 1, "DCVX");
     return;
  }
  if(!upload_id.match(/^#/)) {
    upload_id = "#" + upload_id;
  }
  var el;
  try {
    el = document.querySelector(upload_id) ;
  }
  catch(e) {
      daxtra_cvx._set_error(e.message, e.code, "JS");
      return;
  }
  if(!el) {
     daxtra_cvx._set_error("Cannot find  element with id " +  upload_id, 2, "DCVX");
     return;
  }
  if(el_type && el_type.toLowerCase() != el.type.toLowerCase()) {
     daxtra_cvx._set_error("Element with id " +  upload_id + " is not of type " + el_type, 3, "DCVX");
     return;
  }
  return el;
},

_set_error: function (message, code, source)
{
  daxtra_cvx.last_error.code=code;
  daxtra_cvx.last_error.message=message;
  daxtra_cvx.last_error.source=source;
},
_error_to_json_string: function ()
{
   var ret_string = '{"CSERROR":{'
                       +    '"message":"' + daxtra_cvx.last_error.message 
                       + '", "code":"'    + daxtra_cvx.last_error.code
                       + '", "source":"'  + daxtra_cvx.last_error.source 
                       + '"}}';

  return ret_string;
},

_supportFileType: function() {
    var input = document.createElement('INPUT');
    input.type = 'file';
    return 'files' in input;
},
_supportFormData: function() {
    return !! window.FormData;
},
_supportAjaxUploadProgressEvents: function () {
    var xhr = new XMLHttpRequest();
    return !! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
}

};



var daxtra_form_populator = {

multi_field_delim: ", ",

execute: function (profile_json, cvx_mapping_json)
{
   var retArray = [ ];
   for(var i=0; i<1000; i++) 
   {
      var binding = cvx_mapping_json.bindings[i];
      if(!binding) { break; }
      var prf_field="";
      if(binding.prf_field_array) 
      {
         var val_array = daxtra_form_populator.getProfileFieldMult(profile_json, binding.prf_field_array);
         if(!val_array || val_array.length==0) continue;  
         if(binding.transform) {
           prf_field = binding.transform(val_array);
           if(!prf_field) continue; 
         }
         else {
           for(var j=0; j<val_array.length; j++) {
             if(j>0) prf_field += daxtra_form_populator.multi_field_delim;
             prf_field += val_array[j];
           }
        }
      }
      else if(binding.prf_field){
          prf_field = daxtra_form_populator.getProfileField(profile_json, binding.prf_field);
          if(!prf_field) continue;
          if(binding.transform) {
             prf_field = binding.transform(prf_field);
             if(!prf_field) continue; 
          }
      }
    
      daxtra_form_populator.setFormField(binding.html_field, prf_field);
      retArray.push(binding.html_field);
   }
   return retArray;  
},

getProfileFieldMult : function (profile_json, path_elements)
{
   var cur_el=profile_json;
   var myArray = [ ];
   for(var i=0; i<path_elements.length; i++) {
      var prf_field =  daxtra_form_populator.getProfileField(profile_json, path_elements[i]);
      if(!prf_field) prf_field = ""; //still record no value
      myArray.push(prf_field);
   }
   return myArray;
},

getProfileField : function (profile_json, path)
{
   var path_elements = path.split("."); 
   var cur_el=profile_json;
   for(var i=0; i<path_elements.length; i++) {
     if(path_elements[i].match(/\[[0-9]+\]$/)) {
       var  ddd = path_elements[i].replace(/\[[0-9]+\]$/, "");
       if(! eval("cur_el." + ddd) ) {
          cur_el=""; 
          break;
       }
     }
     cur_el = eval("cur_el." + path_elements[i]);
     if(!cur_el) break;
   }
   return cur_el;
},

setFormField: function (html_field, prf_field)
{
  daxtra_form_populator._setValueOnFormElementAll( document.querySelectorAll(html_field), prf_field );
   //daxtra_form_populator.setValueOnFormElement( document.querySelector(html_field), prf_field );
},

_setValueOnFormElementAll: function (matches, value)
{
  for(var i = 0; i < matches.length; i++) {
     daxtra_form_populator.setValueOnFormElement(matches[i], value, 1);
  }
},

setValueOnFormElement: function (el, value, no_expand) 
{
  if(!el) return;
     
  if(el.tagName == "SPAN" || el.tagName == "P" || el.tagName=="LABEL") { el.innerHTML=value; return;}

  if(el.tagName =="INPUT" || el.tagName =="SELECT" || el.tagName=="TEXTAREA")
  {
     var input_type = el.type.toLowerCase();

     if(input_type == 'hidden'   || input_type == 'text' || input_type=='textarea' ||  input_type=='password' 
     || input_type == 'datetime' || input_type == 'datetime-local'  
     || input_type == 'date'     || input_type == 'month' || input_type ==  'week' 
     || input_type == 'time'     || input_type == 'number'  || input_type == 'range' 
     || input_type == 'email'    || input_type == 'url') {
          el.value=value;
          return;
     }
     if(el.type == 'checkbox' && no_expand) //-- multiple values
     {
        if(el.value==value) 
              el.checked  = true;
        return;
     }
     if(el.type == 'checkbox' ) //-- multiple values
     {
        var children = document.getElementsByName(el.name);
        for(var i = 0; i < children.length; i++) {
           var child = children[i];
           if (child.value == value)
              child.checked  = true;
        }
        return;
     }
     if(el.type == 'radio' && no_expand) //-- exclusive value
     {
           if (el.value == value)
	         el.checked  = true;
           else  el.checked  = false;
           return;
     }
     if(el.type == 'radio' ) //-- exclusive value
     {
        var children = document.getElementsByName(el.name);
        for(var i = 0; i < children.length; i++) {
           var child = children[i];
	   if (child.value == value)
	         child.checked  = true;
           else  child.checked  = false;
        }
        return;
     }
     if(el.type == 'select-one')
     {
        for(var i = 0; i < el.children.length; i++) {
            var child = el.children[i];
            if(child.value == value) {
               el.selected=value;
               el.selectedIndex = i;
               break;
            }
         }
         return;
     }
     if(el.type == 'select-multiple')
     {
        var value_str = "" +  value;
        var values  = value_str.split(",");
        for(var y = 0;  y<values.length; y++) values[y]= values[y].trim();
        for(var i = 0; i < el.children.length; i++) {
           var child = el.children[i];
           var selected=0;
           for(var y = 0;  y<values.length; y++) {
	      if (child.value == values[y]) {
	         child.selected = true;
                 selected=1;
	         break;
	      }
          }
          if(!selected) child.selected = false;
       }
       return;
     }
   }
},


_dummy: function() {
}

};



}

