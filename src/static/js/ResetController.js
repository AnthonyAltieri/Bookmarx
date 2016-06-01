(function() {
  'use strict';
  console.log('hi');
  function createXHR()
  {
    try { return new XMLHttpRequest(); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
    try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}

    return null;
  }

  function sendRequest(url, payload)
  {
    var xhr = createXHR();

    if (xhr)
    {
      xhr.open("POST",url,true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function(){handleResponse(xhr);};
      xhr.send(payload);
    }

  }

  function handleResponse(xhr)
  {
    if (xhr.readyState == 4  && xhr.status == 200)
    {
      /*var responseOutput = document.getElementById("responseOutput");
      responseOutput.innerHTML = xhr.responseText;*/
      console.log('password reset!');
      var response = JSON.parse(xhr.responseText.toString());
      console.log(xhr.JSON);
      console.log(response.msg);
      if(response.msg === 'Could not find user'){
        humane.log('Could not find matching username, or link expired', {addCls: 'humane-flatty-info'});
        return;
      }
      else{
        console.log('why still here');
        location.href = '/';
      }
    }
  }

  function validateForm(){
    console.log('validating form');
    //event.preventDefault();
    var password1 = document.getElementById('password1').value;
    var password2 = document.getElementById('password2').value;
    var email = document.getElementById('email').value;

    if(!email || email.trim().length === 0){
      humane.log('You need to enter a username', {addCls: 'humane-flatty-info'});
      console.log('No username content');
      return;
    }
    if(!password1 || password1.trim().length === 0){
      humane.log('You need to enter a password', {addCls: 'humane-flatty-info'});
      return;
    }
    else if(!password2 || password2.trim().length === 0) {
      humane.log('You need to confirm a password', {addCls: 'humane-flatty-info'});
      return;
    }
    else if (password1 != password2) {
      // Do something, probably toast
      humane.log("Your passwords don't match!", {addCls: 'humane-flatty-info'});
      console.log("Passwords don't match");
      return;
    }
    document.getElementById('password1').value = '';
    document.getElementById('password2').value = '';
    document.getElementById('email').value = '';

    var url = window.location.href;
    var payload = "password=" + encodeURI(password1) + '&username=' + encodeURI(email);
    sendRequest(url,payload);
  }

  document.getElementById('submit-btn').addEventListener('click',function(){
    validateForm();
  });
})();