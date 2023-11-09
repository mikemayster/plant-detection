/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');

    $('ons-button').on('click', function(e) {
        takePhoto();
    })
}

function takePhoto() {
    navigator.camera.getPicture(onSuccess, onFail, {  
        quality: 80, 
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.PICTURE,
        encodingType: Camera.EncodingType.JPEG,
        cameraDirection: Camera.Direction.BACK,
        targetWidth: 300,
        targetHeight: 400 
     });  
     
     function onSuccess(imageData) { 
        $("#myImage")[0].src = "data:image/jpeg;base64," + imageData; 
        clasifyImage(imageData);
     }  
     
     function onFail(message) { 
        ons.notification.alert('Failed because: ' + message);
     } 
  }

  function clasifyImage(imageData){
    $("ons-progress-circular")[0].style.display = null;

    var tf = new TensorFlow('inception-v1');

    tf.onprogress = function(evt) {
        if (evt['status'] == 'downloading'){
            console.log("Downloading model files...");
            console.log(evt.label);
            if (evt.detail) {
                var loaded = evt.detail.loaded/1024/1024;
                var total = evt.detail.total/1024/1024;
                
                loaded = loaded.toFixed(2);
                total = total.toFixed(2);
                
                var perc = (loaded * 100 / total).toFixed(2);

                console.log(`${perc}% ${loaded}MB de ${total}MB`);
            }
        } else if (evt['status'] == 'unzipping') {
            console.log("Extracting contents...");
        } else if (evt['status'] == 'initializing') {
            console.log("Initializing TensorFlow");
        }
    };
    
    tf.classify(imageData).then(function(results) {
        $("ons-progress-circular")[0].style.display = 'none';

        var html = '<ons-list modifier="inset">';
        html += '<ons-list-header>Result list</ons-list-header>';
        results.forEach(function(result) {
            console.log(result.title + " " + result.confidence);
            html += `<ons-list-item modifier="longdivider">${result.title} - ${result.confidence}</ons-list-item>`;
        });
        html += "</ons-list>";
        $("#result").html(html);
    });
  }