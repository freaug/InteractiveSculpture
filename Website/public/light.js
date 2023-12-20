// Construct URLSearchParams object instance from current URL querystring.
var queryParams = new URLSearchParams(window.location.search);

let socket = io();

let vals = {b:0, o:0, v:0}

socket.on("pulseLight", updateLight);

function updateLight(data) {
  //console.log(data);
  //document.write(" ");
  // Set new or modify existing parameter value.
  queryParams.set("b", data.b);
  queryParams.set("o", data.o);
  queryParams.set("v", data.v);
  
  vals[0] = data.b;
  vals[1] = data.o;
  vals[2] = data.v;
  
  let json = JSON.stringify(vals);

  

  // Replace current querystring with the new one.
  history.pushState(null, null, "?" + queryParams.toString());

}

