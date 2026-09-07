var allowContinuousJog = false;
var continuousJogRunning = false;
var jogdistXYZ = 10;
var jogdistA = 10;
var safeToUpdateSliders = true;
var jogRateX = 4000
var jogRateY = 4000
var jogRateZ = 2000
var jogRateA = 2000

function jogOverride(newVal) {
  if (grblParams.hasOwnProperty('$110')) {
    jogRateX = (grblParams['$110'] * (newVal / 100)).toFixed(0);
    jogRateY = (grblParams['$111'] * (newVal / 100)).toFixed(0);
    jogRateZ = (grblParams['$112'] * (newVal / 100)).toFixed(0);

    $('#jro').data('slider').val(newVal)
  }
  if (grblParams.hasOwnProperty('$113')) {
    jogRateA = (grblParams['$113'] * (newVal / 100)).toFixed(0);
  }
  localStorage.setItem('jogOverride', newVal);
}

function setADist(newADist) {
  $("#distAAxislabel").html("A: " + newADist + " deg")
  jogdistA = newADist;
}

function mmMode() {
  unit = "mm";
  localStorage.setItem('unitsMode', unit);
  $('#dist01label').html('0.1mm')
  $('#dist1label').html('1mm')
  $('#dist10label').html('10mm')
  $('#dist100label').html('100mm')
  if (jogdistXYZ == 0.0254) {
    jogdistXYZ = 0.1
  }
  if (jogdistXYZ == 0.254) {
    jogdistXYZ = 1
  }
  if (jogdistXYZ == 2.54) {
    jogdistXYZ = 10
  }
  if (jogdistXYZ == 25.4) {
    jogdistXYZ = 100
  }
  syncDistCycleLabel();
  if (typeof object !== 'undefined') {
    if (object.userData.inch) {
      if (typeof redrawGrid === "function") { // Check if function exists, because in Mobile view it does not
        redrawGrid(object.userData.bbbox2.min.x * 25.4, object.userData.bbbox2.max.x * 25.4, object.userData.bbbox2.min.y * 25.4, object.userData.bbbox2.max.y * 25.4, false);
      }
    } else {
      if (typeof redrawGrid === "function") { // Check if function exists, because in Mobile view it does not
        redrawGrid(object.userData.bbbox2.min.x, object.userData.bbbox2.max.x, object.userData.bbbox2.min.y, object.userData.bbbox2.max.y, false);
      }
    }
  } else {
    if (typeof redrawGrid === "function") { // Check if function exists, because in Mobile view it does not
      redrawGrid(xmin, xmax, ymin, ymax, false);
    }
  }
}

function inMode() {
  unit = "in";
  localStorage.setItem('unitsMode', unit);
  $('#dist01label').html('0.001"')
  $('#dist1label').html('0.01"')
  $('#dist10label').html('0.1"')
  $('#dist100label').html('1"')
  if (jogdistXYZ == 0.1) {
    jogdistXYZ = 0.0254
  }
  if (jogdistXYZ == 1) {
    jogdistXYZ = 0.254
  }
  if (jogdistXYZ == 10) {
    jogdistXYZ = 2.54
  }
  if (jogdistXYZ == 100) {
    jogdistXYZ = 25.4
  }
  syncDistCycleLabel();

  if (typeof object !== 'undefined') {
    if (object.userData.inch) {
      if (typeof redrawGrid === "function") { // Check if function exists, because in Mobile view it does not
        redrawGrid(object.userData.bbbox2.min.x, object.userData.bbbox2.max.x, object.userData.bbbox2.min.y, object.userData.bbbox2.max.y, true);
      }
    } else {
      if (typeof redrawGrid === "function") { // Check if function exists, because in Mobile view it does not
        redrawGrid(object.userData.bbbox2.min.x / 25.4, object.userData.bbbox2.max.x / 25.4, object.userData.bbbox2.min.y / 25.4, object.userData.bbbox2.max.y / 25.4, true);
      }
    }
  } else {
    if (typeof redrawGrid === "function") { // Check if function exists, because in Mobile view it does not
      redrawGrid(xmin / 25.4, xmax / 25.4, ymin / 25.4, ymax / 25.4, true);
    }
  }

}

function cancelJog() {
  socket.emit('stop', {
    stop: false,
    jog: true,
    abort: false
  })
  continuousJogRunning = false;
}


$(document).ready(function() {

  if (localStorage.getItem('continuousJog')) {
    if (JSON.parse(localStorage.getItem('continuousJog')) == true) {
      $('#jogTypeContinuous').prop('checked', true)
      allowContinuousJog = true;
      $('.distbtn').hide()
    } else {
      $('#jogTypeContinuous').prop('checked', false)
      allowContinuousJog = false;
      $('.distbtn').show();
    }
  }

  $('#jogTypeContinuous').on('click', function() {
    if ($(this).is(':checked')) {
      localStorage.setItem('continuousJog', true);
      allowContinuousJog = true;
      $('.distbtn').hide();
    } else {
      localStorage.setItem('continuousJog', false);
      allowContinuousJog = false;
      $('.distbtn').show();
    }
    // console.log(document.activeElement)
    document.activeElement.blur();
  });

  if (localStorage.getItem('unitsMode')) {
    if (localStorage.getItem('unitsMode') == "mm") {
      mmMode()
      $('#mmMode').click()
    } else if (localStorage.getItem('unitsMode') == "in") {
      inMode();
      $('#inMode').click()
    }
  } else {
    // default to inches
    inMode();
    $('#inMode').click()
  }

  $(document).mousedown(function(e) {
    safeToUpdateSliders = false;
  }).mouseup(function(e) {
    safeToUpdateSliders = true;
    // Added to cancel Jog moves even when user moved the mouse off the button before releasing
    if (allowContinuousJog) {
      if (continuousJogRunning) {
        cancelJog()
      }
    }
  }).mouseleave(function(e) {
    safeToUpdateSliders = true;
  });

  $("#xPosDro").click(function() {
    $("#xPos").hide()
    $("#xPosDro").addClass("drop-shadow");
    if (unit == "mm") {
      $("#xPosInput").show().focus().val(laststatus.machine.position.work.x)
    } else if (unit == "in") {
      $("#xPosInput").show().focus().val((laststatus.machine.position.work.x / 25.4).toFixed(3))
    }
    document.getElementById("xPosInput").select();
  });

  $("#xPosInput").blur(function() {
    $("#xPosDro").removeClass("drop-shadow");
    $("#xPos").show()
    $("#xPosInput").hide()
  });

  $('#xPosInput').on('keypress', function(e) {
    console.log(e)
    if (e.key === "Enter" || e.key === "NumpadEnter") {
      //Disable textbox to prevent multiple submit
      $(this).attr("disabled", "disabled");
      $("#xPos").show()
      $("#xPosInput").hide()
      //Enable the textbox again if needed.
      $(this).removeAttr("disabled");
      if (unit == "mm") {
        if (e.shiftKey) {
          sendGcode("G21\nG10 P0 L20 X" + $("#xPosInput").val());
        } else {
          sendGcode("$J=G90 G21 X" + $("#xPosInput").val() + " F" + jogRateX);
        }

      } else if (unit == "in") {
        if (e.shiftKey) {
          sendGcode("G21\nG10 P0 L20 X" + ($("#xPosInput").val() * 25.4));
        } else {
          sendGcode("$J=G90 G20 X" + $("#xPosInput").val() + " F" + jogRateX);
        }
      }
    }
  });

  $("#yPosDro").click(function() {
    $("#yPos").hide()
    $("#yPosDro").addClass("drop-shadow");
    if (unit == "mm") {
      $("#yPosInput").show().focus().val(laststatus.machine.position.work.y)
    } else if (unit == "in") {
      $("#yPosInput").show().focus().val((laststatus.machine.position.work.y / 25.4).toFixed(3))
    }
    document.getElementById("yPosInput").select();
  });

  $("#yPosInput").blur(function() {
    $("#yPos").show()
    $("#yPosDro").removeClass("drop-shadow");
    $("#yPosInput").hide()
  });

  $('#yPosInput').on('keypress', function(e) {
    if (e.which === 13) {
      //Disable textbox to prevent multiple submit
      $(this).attr("disabled", "disabled");
      $("#yPos").show()
      $("#yPosInput").hide()
      //Enable the textbox again if needed.
      $(this).removeAttr("disabled");
      if (unit == "mm") {
        if (e.shiftKey) {
          sendGcode("G21\nG10 P0 L20 Y" + $("#yPosInput").val());
        } else {
          sendGcode("$J=G90 G21 Y" + $("#yPosInput").val() + " F" + jogRateY);
        }
      } else if (unit == "in") {
        if (e.shiftKey) {
          sendGcode("G21\nG10 P0 L20 Y" + ($("#yPosInput").val() * 25.4));
        } else {
          sendGcode("$J=G90 G20 Y" + $("#yPosInput").val() + " F" + jogRateY);
        }
      }
    }
  });

  $("#zPosDro").click(function() {
    $("#zPos").hide()
    $("#zPosDro").addClass("drop-shadow");
    if (unit == "mm") {
      $("#zPosInput").show().focus().val(laststatus.machine.position.work.z)
    } else if (unit == "in") {
      $("#zPosInput").show().focus().val((laststatus.machine.position.work.z / 25.4).toFixed(3))
    }
    document.getElementById("zPosInput").select();
  });

  $("#zPosInput").blur(function() {
    $("#zPos").show()
    $("#zPosDro").removeClass("drop-shadow");
    $("#zPosInput").hide()
  });

  $('#zPosInput').on('keypress', function(e) {
    if (e.which === 13) {
      //Disable textbox to prevent multiple submit
      $(this).attr("disabled", "disabled");
      $("#zPos").show()
      $("#zPosInput").hide()
      //Enable the textbox again if needed.
      $(this).removeAttr("disabled");
      if (unit == "mm") {
        if (e.shiftKey) {
          sendGcode("G21\nG10 P0 L20 Z" + $("#zPosInput").val());
        } else {
          sendGcode("$J=G90 G21 Z" + $("#zPosInput").val() + " F" + jogRateZ);
        }
      } else if (unit == "in") {
        if (e.shiftKey) {
          sendGcode("G21\nG10 P0 L20 Z" + ($("#zPosInput").val() * 25.4));
        } else {
          sendGcode("$J=G90 G20 Z" + $("#zPosInput").val() + " F" + jogRateZ);
        }
      }
    }
  });


  // A Axis DRO entry
  $("#aPosDro").click(function() {
    $("#aPos").hide()
    $("#aPosDro").addClass("drop-shadow");
    $("#aPosInput").show().focus().val(laststatus.machine.position.work.a)
    document.getElementById("aPosInput").select();
  });

  $("#aPosInput").blur(function() {
    $("#aPos").show()
    $("#aPosDro").removeClass("drop-shadow");
    $("#aPosInput").hide()
  });

  $('#aPosInput').on('keypress', function(e) {
    if (e.which === 13) {
      //Disable textbox to prevent multiple submit
      $(this).attr("disabled", "disabled");
      $("#aPos").show()
      $("#aPosInput").hide()
      //Enable the textbox again if needed.
      $(this).removeAttr("disabled");

      if (e.shiftKey) {
        sendGcode("G21\nG10 P0 L20 A" + $("#aPosInput").val());
      } else {
        sendGcode("$J=G90 G21 A" + $("#aPosInput").val() + " F" + jogRateA);
      }

    }
  });

  // End A-Axis DRO Entry


  $('#dist01').on('click', function(ev) {
    if (unit == "mm") {
      jogdistXYZ = 0.1;
    } else if (unit == "in") {
      jogdistXYZ = 0.0254;
    }
    $('.distbtn').removeClass('bd-accent')
    $('#dist01').addClass('bd-accent')
    $('.jogdistXYZ').removeClass('fg-accent')
    $('.jogdistXYZ').addClass('fg-gray')
    $('#dist01label').removeClass('fg-gray')
    $('#dist01label').addClass('fg-accent')
  })

  $('#dist1').on('click', function(ev) {
    if (unit == "mm") {
      jogdistXYZ = 1;
    } else if (unit == "in") {
      jogdistXYZ = 0.254;
    }
    $('.distbtn').removeClass('bd-accent')
    $('#dist1').addClass('bd-accent')
    $('.jogdistXYZ').removeClass('fg-accent')
    $('.jogdistXYZ').addClass('fg-gray')
    $('#dist1label').removeClass('fg-gray')
    $('#dist1label').addClass('fg-accent')
  })

  $('#dist10').on('click', function(ev) {
    if (unit == "mm") {
      jogdistXYZ = 10;
    } else if (unit == "in") {
      jogdistXYZ = 2.54;
    }
    $('.distbtn').removeClass('bd-accent')
    $('#dist10').addClass('bd-accent')
    $('.jogdistXYZ').removeClass('fg-accent')
    $('.jogdistXYZ').addClass('fg-gray')
    $('#dist10label').removeClass('fg-gray')
    $('#dist10label').addClass('fg-accent')
  })

  $('#dist100').on('click', function(ev) {
    if (unit == "mm") {
      jogdistXYZ = 100;
    } else if (unit == "in") {
      jogdistXYZ = 25.4;
    }
    $('.distbtn').removeClass('bd-accent')
    $('#dist100').addClass('bd-accent')
    $('.jogdistXYZ').removeClass('fg-accent')
    $('.jogdistXYZ').addClass('fg-gray')
    $('#dist100label').removeClass('fg-gray')
    $('#dist100label').addClass('fg-accent')
  })

  $('#gotozeroWPos').on('click', function(ev) {
    gotoZeroWorkCoord();
  });

  $('#gotoXzeroMpos').on('click', function(ev) {
    if (grblParams['$22'] == 1) {
      sendGcode('G53 G0 X-' + grblParams["$27"]);
    } else {
      sendGcode('G53 G0 X0');
    }
  });

  $('#gotoYzeroMpos').on('click', function(ev) {
    if (grblParams['$22'] == 1) {
      sendGcode('G53 G0 Y-' + grblParams["$27"]);
    } else {
      sendGcode('G53 G0 Y0');
    }
  });

  $('#gotoZzeroMpos').on('click', function(ev) {
    if (grblParams['$22'] == 1) {
      sendGcode('G53 G0 Z-' + grblParams["$27"]);
    } else {
      sendGcode('G53 G0 Z0');
    }
  });

  $('#gotozeroZmPosXYwPos').on('click', function(ev) {
    gotoZeroMachineZRetract();
  });

  $('#gotozeroMPos').on('click', function(ev) {
    if (grblParams['$22'] == 1) {
      sendGcode('G53 G0 Z-' + grblParams["$27"]);
      sendGcode('G53 G0 X-' + grblParams["$27"] + ' Y-' + grblParams["$27"]);
    } else {
      sendGcode('G53 G0 Z0');
      sendGcode('G53 G0 X0 Y0');
    }
  });




  $('.xM').on('touchstart mousedown', function(ev) {
    //console.log(ev)
    if (ev.which > 1) {
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "X-";
        var distance = 1000;

        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$130)
          var maxdistance = 0; // Grbl all negative coordinates
          // Negative move:
          distance = (mindistance + (parseFloat(laststatus.machine.position.offset.x) + parseFloat(laststatus.machine.position.work.x))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("X-");
          }
        }

        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateX + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('.xM').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('X', '-' + jogdistXYZ, jogRateX);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.xM').on('touchend mouseup', function(ev) {
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('.xP').on('touchstart mousedown', function(ev) {
    // console.log("xp down")
    if (ev.which > 1) {
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "X";
        var distance = 1000;
        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$130)
          var maxdistance = 0; // Grbl all negative coordinates
          // Positive move:
          distance = (maxdistance - (parseFloat(laststatus.machine.position.offset.x) + parseFloat(laststatus.machine.position.work.x))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("X+");
          }
        }
        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateX + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('.xP').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('X', jogdistXYZ, jogRateX);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.xP').on('touchend mouseup', function(ev) {
    // console.log("xp up")
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('.yM').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) { // Ignore middle and right click
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "Y-";
        var distance = 1000;

        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$131)
          var maxdistance = 0; // Grbl all negative coordinates
          // Negative move:
          distance = (mindistance + (parseFloat(laststatus.machine.position.offset.y) + parseFloat(laststatus.machine.position.work.y))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("Y-");
          }
        }

        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateY + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('.yM').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('Y', '-' + jogdistXYZ, jogRateY);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.yM').on('touchend mouseup', function(ev) {
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('.yP').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) { // Ignore middle and right click
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "Y";
        var distance = 1000;

        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$131)
          var maxdistance = 0; // Grbl all negative coordinates
          // Positive move:
          distance = (maxdistance - (parseFloat(laststatus.machine.position.offset.y) + parseFloat(laststatus.machine.position.work.y))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("Y+");
          }
        }

        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateY + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('#yP').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('Y', jogdistXYZ, jogRateY);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.yP').on('touchend mouseup', function(ev) {
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('.zM').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) { // Ignore middle and right click
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "Z-";
        var distance = 1000;

        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$132)
          var maxdistance = 0; // Grbl all negative coordinates
          // Negative move:
          distance = (mindistance + (parseFloat(laststatus.machine.position.offset.z) + parseFloat(laststatus.machine.position.work.z))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("Z-");
          }
        }

        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateZ + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('.zM').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('Z', '-' + jogdistXYZ, jogRateZ);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.zM').on('touchend mouseup', function(ev) {
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('.zP').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) { // Ignore middle and right click
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "Z";
        var distance = 1000;

        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$132)
          var maxdistance = 0; // Grbl all negative coordinates
          // Positive move:
          distance = (maxdistance - (parseFloat(laststatus.machine.position.offset.z) + parseFloat(laststatus.machine.position.work.z))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("Z+");
          }
        }

        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateZ + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('.zP').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('Z', jogdistXYZ, jogRateZ);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.zP').on('touchend mouseup', function(ev) {
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('.aM').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) { // Ignore middle and right click
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "A-";
        var distance = 1000;

        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$133)
          var maxdistance = 0; // Grbl all negative coordinates
          // Negative move:
          distance = (mindistance + (parseFloat(laststatus.machine.position.offset.a) + parseFloat(laststatus.machine.position.work.a))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("A-");
          }
        }

        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateA + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('.aM').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('A', '-' + jogdistA, jogRateA);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.aM').on('touchend mouseup', function(ev) {
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('.aP').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) { // Ignore middle and right click
      return
    }
    ev.preventDefault();
    var hasSoftLimits = false;
    if (Object.keys(grblParams).length > 0) {
      if (parseInt(grblParams.$20) == 1) {
        hasSoftLimits = true;
      }
    }
    if (allowContinuousJog) { // startJog();
      if (!waitingForStatus && laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0") {
        var direction = "A";
        var distance = 1000;

        if (hasSoftLimits) {
          // Soft Limits is enabled so lets calculate maximum move distance
          var mindistance = parseInt(grblParams.$133)
          var maxdistance = 0; // Grbl all negative coordinates
          // Positive move:
          distance = (maxdistance - (parseFloat(laststatus.machine.position.offset.a) + parseFloat(laststatus.machine.position.work.a))) - 1
          distance = distance.toFixed(3);
          if (distance < 1) {
            toastJogWillHit("A+");
          }
        }

        if (distance >= 1) {
          socket.emit('runCommand', "$J=G91 G21 " + direction + distance + " F" + jogRateA + "\n");
          continuousJogRunning = true;
          waitingForStatus = true;
          $('.aP').click();
        }
      } else {
        toastJogNotIdle();
      }
    } else {
      jog('A', jogdistA, jogRateA);
    }
    $('#runNewProbeBtn').addClass("disabled")
    $('#confirmNewProbeBtn').removeClass("disabled")
  });
  $('.aP').on('touchend mouseup', function(ev) {
    ev.preventDefault();
    if (allowContinuousJog) {
      cancelJog()
    }
  });


  $('#homeBtn').on('click', function(ev) {
    home();
  })

  $('#chkSize').on('click', function() {
    var bbox2 = new THREE.Box3().setFromObject(object);
    console.log('bbox for Draw Bounding Box: ' + object + ' Min X: ', (bbox2.min.x), '  Max X:', (bbox2.max.x), 'Min Y: ', (bbox2.min.y), '  Max Y:', (bbox2.max.y));
    var feedrate = 5000
    if (laststatus.machine.firmware.type === 'grbl') {
      var moves = `
        $J=G90G21X` + (bbox2.min.x).toFixed(3) + ` Y` + (bbox2.min.y).toFixed(3) + ` F` + feedrate + `\n
        $J=G90G21X` + (bbox2.max.x).toFixed(3) + ` Y` + (bbox2.min.y).toFixed(3) + ` F` + feedrate + `\n
        $J=G90G21X` + (bbox2.max.x).toFixed(3) + ` Y` + (bbox2.max.y).toFixed(3) + ` F` + feedrate + `\n
        $J=G90G21X` + (bbox2.min.x).toFixed(3) + ` Y` + (bbox2.max.y).toFixed(3) + ` F` + feedrate + `\n
        $J=G90G21X` + (bbox2.min.x).toFixed(3) + ` Y` + (bbox2.min.y).toFixed(3) + ` F` + feedrate + `\n
        `;
    } else {
      var moves = `
       G90\n
       G0 X` + (bbox2.min.x).toFixed(3) + ` Y` + (bbox2.min.y).toFixed(3) + ` F` + feedrate + `\n
       G0 X` + (bbox2.max.x).toFixed(3) + ` Y` + (bbox2.min.y).toFixed(3) + ` F` + feedrate + `\n
       G0 X` + (bbox2.max.x).toFixed(3) + ` Y` + (bbox2.max.y).toFixed(3) + ` F` + feedrate + `\n
       G0 X` + (bbox2.min.x).toFixed(3) + ` Y` + (bbox2.max.y).toFixed(3) + ` F` + feedrate + `\n
       G0 X` + (bbox2.min.x).toFixed(3) + ` Y` + (bbox2.min.y).toFixed(3) + ` F` + feedrate + `\n
       G90\n`;
    }
    socket.emit('runJob', {
      data: moves,
      isJob: false,
      fileName: ""
    });
  });

});

function changeStepSize(dir) {
  $('.distbtn').blur();
  if (jogdistXYZ == 0.1 || jogdistXYZ == 0.0254) {
    if (dir == 1) {
      if (unit == "mm") {
        jogdistXYZ = 1;
      } else if (unit == "in") {
        jogdistXYZ = .254;
      }
      $('.distbtn').removeClass('bd-accent')
      $('#dist1').addClass('bd-accent')
      $('.jogdistXYZ').removeClass('fg-accent')
      $('.jogdistXYZ').addClass('fg-gray')
      $('#dist1label').removeClass('fg-gray')
      $('#dist1label').addClass('fg-dark')
    }
    if (dir == -1) {
      // do nothing
    }
  } else if (jogdistXYZ == 1 || jogdistXYZ == 0.254) {
    if (dir == 1) {
      if (unit == "mm") {
        jogdistXYZ = 10;
      } else if (unit == "in") {
        jogdistXYZ = 2.54;
      }
      $('.distbtn').removeClass('bd-accent')
      $('#dist10').addClass('bd-accent')
      $('.jogdistXYZ').removeClass('fg-accent')
      $('.jogdistXYZ').addClass('fg-gray')
      $('#dist10label').removeClass('fg-gray')
      $('#dist10label').addClass('fg-accent')
    }
    if (dir == -1) {
      if (unit == "mm") {
        jogdistXYZ = 0.1;
      } else if (unit == "in") {
        jogdistXYZ = 0.0254;
      }
      $('.distbtn').removeClass('bd-accent')
      $('#dist01').addClass('bd-accent')
      $('.jogdistXYZ').removeClass('fg-accent')
      $('.jogdistXYZ').addClass('fg-gray')
      $('#dist01label').removeClass('fg-gray')
      $('#dist01label').addClass('fg-accent')
    }
  } else if (jogdistXYZ == 10 || jogdistXYZ == 2.54) {
    if (dir == 1) {
      if (unit == "mm") {
        jogdistXYZ = 100;
      } else if (unit == "in") {
        jogdistXYZ = 25.4;
      }
      $('.distbtn').removeClass('bd-accent')
      $('#dist100').addClass('bd-accent')
      $('.jogdistXYZ').removeClass('fg-accent')
      $('.jogdistXYZ').addClass('fg-gray')
      $('#dist100label').removeClass('fg-gray')
      $('#dist100label').addClass('fg-accent')
    }
    if (dir == -1) {
      if (unit == "mm") {
        jogdistXYZ = 1;
      } else if (unit == "in") {
        jogdistXYZ = 0.254;
      }
      $('.distbtn').removeClass('bd-accent')
      $('#dist1').addClass('bd-accent')
      $('.jogdistXYZ').removeClass('fg-accent')
      $('.jogdistXYZ').addClass('fg-gray')
      $('#dist1label').removeClass('fg-gray')
      $('#dist1label').addClass('fg-accent')
    }
  } else if (jogdistXYZ == 100 || jogdistXYZ == 25.4) {
    if (dir == 1) {
      // do nothing
    }
    if (dir == -1) {
      if (unit == "mm") {
        jogdistXYZ = 10;
      } else if (unit == "in") {
        jogdistXYZ = 2.54;
      }
      $('.distbtn').removeClass('bd-accent')
      $('#dist10').addClass('bd-accent')
      $('.jogdistXYZ').removeClass('fg-accent')
      $('.jogdistXYZ').addClass('fg-gray')
      $('#dist10label').removeClass('fg-gray')
      $('#dist10label').addClass('fg-accent')
    }
  }

}

function jog(dir, dist, feed = null) {
  if (feed) {
    socket.emit('jog', dir + ',' + dist + ',' + feed);
  } else {
    socket.emit('jog', dir + ',' + dist);
  }
}

function jogXY(xincrement, yincrement, feed = null) {
  var data = {
    x: xincrement,
    y: yincrement,
    feed: feed
  }
  socket.emit('jogXY', data);
}

function home() {
  if (laststatus != undefined && laststatus.machine.firmware.type == 'grbl') {
    sendGcode('$H')
  } else if (laststatus != undefined && laststatus.machine.firmware.type == 'smoothie') {
    sendGcode('G28')
  }
}

// Retracts Z a fixed 5mm above the current WORK Z-zero, then moves to work X0 Y0, then plunges to work Z0.
// Deterministic regardless of homing state, so this is the safe fallback when we can't
// confirm the machine has actually been homed this session.
function gotoZeroWorkCoord() {
  sendGcode('G21 G90');
  sendGcode('G0 Z5');
  sendGcode('G0 X0 Y0');
  sendGcode('G0 Z0');
}

// Retracts Z using the MACHINE coordinate system (G53) before moving to work X0 Y0, then
// plunging to work Z0. Only meaningful if the machine has actually been homed this
// session - otherwise G53 Z0 is an arbitrary, unverified position.
function gotoZeroMachineZRetract() {
  if (grblParams['$22'] == 1) {
    sendGcode('G53 G0 Z-' + grblParams["$27"]);
  } else {
    sendGcode('G53 G0 Z0');
  }
  sendGcode('G0 X0 Y0');
  sendGcode('G0 Z0');
}

// Default action for the GOTOZERO button: uses the machine-coordinate retract only when
// this session has actually run a homing cycle (not just when homing is enabled in
// settings), otherwise falls back to the always-safe work-coordinate retract.
function gotoZeroSmart() {
  if (laststatus !== undefined && laststatus.machine.modals.homedRecently == true) {
    gotoZeroMachineZRetract();
  } else {
    gotoZeroWorkCoord();
  }
}

function toastJogWillHit(axis) {
  printLog("<span class='fg-red'>[ jog ] </span><span class='fg-red'>Unable to jog toward " + axis + ", will hit soft-limit</span>")
  var toast = Metro.toast.create;
  toast("Unable to jog toward " + axis + ", will hit soft-limit", null, 1000, "bg-darkRed fg-white")
}

function toastJogNotIdle(axis) {
  printLog("<span class='fg-red'>[ jog ] </span><span class='fg-red'>Please wait for machine to be Idle, before jogging</span>")
  var toast = Metro.toast.create;
  toast("Please wait for machine to be Idle, before jogging. Try again once it is Idle", null, 1000, "bg-darkRed fg-white")
}

// ==========================================================================
// XY radial jog pad: diagonals, dual-ring (inner=incremental/outer=continuous),
// and the center distance-cycle button.
//
// These are additive and do not alter the existing #xP/#xM/#yP/#yM handlers
// above (or their reliance on the Incremental/Continuous toggle), because
// keyboard.js triggers those exact elements via .mousedown()/.mouseup() for
// arrow-key jogging and expects that toggle-dependent behavior to keep working.
// ==========================================================================

function isMachineIdleForJog() {
  return !waitingForStatus && (laststatus.comms.runStatus == "Idle" || laststatus.comms.runStatus == "Door:0");
}

function hasSoftLimitsEnabled() {
  return Object.keys(grblParams).length > 0 && parseInt(grblParams.$20) == 1;
}

// Clamps a long continuous-jog run to just short of the soft limit on one axis.
// Returns 1000 (the normal "run until canceled" distance) when soft limits are off.
function getContinuousLinearDistance(limitParam, posKey, sign) {
  if (!hasSoftLimitsEnabled()) {
    return 1000;
  }
  var limit = parseInt(grblParams[limitParam]);
  var pos = parseFloat(laststatus.machine.position.offset[posKey]) + parseFloat(laststatus.machine.position.work[posKey]);
  var distance = sign < 0 ? (limit + pos) - 1 : (0 - pos) - 1;
  return parseFloat(distance.toFixed(3));
}

function jogDiagonalIncremental(xSign, ySign) {
  jogXY(xSign * jogdistXYZ, ySign * jogdistXYZ, Math.min(jogRateX, jogRateY));
}

// Outer ring jogs one step size above whatever the inner ring/center button is
// currently set to (e.g. inner=1mm -> outer=10mm). When the inner ring is already
// at its highest step, there is no "next step up" left, so the outer ring falls
// back to its original continuous-jog behavior.
var jogStepValuesMm = [0.1, 1, 10, 100];
var jogStepValuesIn = [0.0254, 0.254, 2.54, 25.4];
var jogStepLabelIds = ['#dist01label', '#dist1label', '#dist10label', '#dist100label'];

function getOuterStepIndex() {
  var steps = unit == "mm" ? jogStepValuesMm : jogStepValuesIn;
  var idx = steps.indexOf(jogdistXYZ);
  if (idx == -1 || idx == steps.length - 1) {
    return -1;
  }
  return idx + 1;
}

function getOuterStepDistance() {
  var idx = getOuterStepIndex();
  if (idx == -1) {
    return null;
  }
  var steps = unit == "mm" ? jogStepValuesMm : jogStepValuesIn;
  return steps[idx];
}

// Keeps the outer ring's tooltips in sync with what pressing them will actually do.
function syncOuterRingTitles() {
  var idx = getOuterStepIndex();
  var stepLabel = idx == -1 ? null : $(jogStepLabelIds[idx]).text();
  function setTitle(sel, axisLabel) {
    $(sel).attr('title', stepLabel == null ? 'Continuous jog ' + axisLabel : 'Jog ' + axisLabel + ' ' + stepLabel);
  }
  setTitle('#xP_out', 'X+');
  setTitle('#xM_out', 'X-');
  setTitle('#yP_out', 'Y+');
  setTitle('#yM_out', 'Y-');
  setTitle('#xyNE_out', 'X+ Y+');
  setTitle('#xyNW_out', 'X- Y+');
  setTitle('#xySE_out', 'X+ Y-');
  setTitle('#xySW_out', 'X- Y-');
}

// Keeps the jog-pad's center distance-cycle button label (and the outer ring's
// tooltips, which depend on the same jogdistXYZ) in sync. Called from the
// dist01/dist1/dist10/dist100 click handlers below, from the center button's own
// click handler, and from mmMode()/inMode() above.
function syncDistCycleLabel() {
  if (jogdistXYZ == 1 || jogdistXYZ == 0.254) {
    $('#jogDistCycleLabel').text($('#dist1label').text());
  } else if (jogdistXYZ == 10 || jogdistXYZ == 2.54) {
    $('#jogDistCycleLabel').text($('#dist10label').text());
  } else if (jogdistXYZ == 100 || jogdistXYZ == 25.4) {
    $('#jogDistCycleLabel').text($('#dist100label').text());
  } else {
    $('#jogDistCycleLabel').text($('#dist01label').text());
  }
  syncOuterRingTitles();
}

function startContinuousLinear(gcodeAxisToken, limitParam, posKey, sign, jogRate, axisLabel) {
  if (!isMachineIdleForJog()) {
    toastJogNotIdle();
    return;
  }
  var distance = getContinuousLinearDistance(limitParam, posKey, sign);
  if (distance < 1) {
    toastJogWillHit(axisLabel);
    return;
  }
  socket.emit('runCommand', "$J=G91 G21 " + gcodeAxisToken + distance + " F" + jogRate + "\n");
  continuousJogRunning = true;
  waitingForStatus = true;
}

function startContinuousDiagonal(xSign, ySign, axisLabel) {
  if (!isMachineIdleForJog()) {
    toastJogNotIdle();
    return;
  }
  var xDist = getContinuousLinearDistance('$130', 'x', xSign);
  var yDist = getContinuousLinearDistance('$131', 'y', ySign);
  var distance = Math.min(xDist, yDist);
  if (distance < 1) {
    toastJogWillHit(axisLabel);
    return;
  }
  var feed = Math.min(jogRateX, jogRateY);
  socket.emit('runCommand', "$J=G91 G21 X" + (xSign * distance) + " Y" + (ySign * distance) + " F" + feed + "\n");
  continuousJogRunning = true;
  waitingForStatus = true;
}

$(document).ready(function() {

  // --- Inner ring diagonals (always incremental, regardless of the toggle) ---
  $('#xyNE_in').on('click', function(ev) { ev.preventDefault(); jogDiagonalIncremental(1, 1); });
  $('#xyNW_in').on('click', function(ev) { ev.preventDefault(); jogDiagonalIncremental(-1, 1); });
  $('#xySE_in').on('click', function(ev) { ev.preventDefault(); jogDiagonalIncremental(1, -1); });
  $('#xySW_in').on('click', function(ev) { ev.preventDefault(); jogDiagonalIncremental(-1, -1); });

  // --- Outer ring: jogs one step above the inner ring's current step; falls back
  // to continuous jog once the inner ring is already at its highest step ---
  $('#xP_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jog('X', step, jogRateX);
    } else {
      startContinuousLinear('X', '$130', 'x', 1, jogRateX, 'X+');
    }
  });
  $('#xM_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jog('X', -step, jogRateX);
    } else {
      startContinuousLinear('X-', '$130', 'x', -1, jogRateX, 'X-');
    }
  });
  $('#yP_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jog('Y', step, jogRateY);
    } else {
      startContinuousLinear('Y', '$131', 'y', 1, jogRateY, 'Y+');
    }
  });
  $('#yM_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jog('Y', -step, jogRateY);
    } else {
      startContinuousLinear('Y-', '$131', 'y', -1, jogRateY, 'Y-');
    }
  });
  $('#xyNE_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jogXY(step, step, Math.min(jogRateX, jogRateY));
    } else {
      startContinuousDiagonal(1, 1, 'X+ Y+');
    }
  });
  $('#xyNW_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jogXY(-step, step, Math.min(jogRateX, jogRateY));
    } else {
      startContinuousDiagonal(-1, 1, 'X- Y+');
    }
  });
  $('#xySE_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jogXY(step, -step, Math.min(jogRateX, jogRateY));
    } else {
      startContinuousDiagonal(1, -1, 'X+ Y-');
    }
  });
  $('#xySW_out').on('touchstart mousedown', function(ev) {
    if (ev.which > 1) return;
    ev.preventDefault();
    var step = getOuterStepDistance();
    if (step !== null) {
      jogXY(-step, -step, Math.min(jogRateX, jogRateY));
    } else {
      startContinuousDiagonal(-1, -1, 'X- Y-');
    }
  });
  $('.jog-cardinal-out, .jog-diag-out').on('touchend mouseup mouseleave', function(ev) {
    ev.preventDefault();
    if (continuousJogRunning) {
      cancelJog();
    }
  });

  // --- Center button: cycle jog distance 1 -> 10 -> 100 -> back to 1 ---
  $('#dist01, #dist1, #dist10, #dist100').on('click', syncDistCycleLabel);
  syncDistCycleLabel();

  $('#jogDistCycle').on('click', function(ev) {
    ev.preventDefault();
    if (unit == "in") {
      if (jogdistXYZ == 0.254) {
        $('#dist10').click();
      } else if (jogdistXYZ == 2.54) {
        $('#dist100').click();
      } else {
        $('#dist1').click();
      }
    } else {
      if (jogdistXYZ == 1) {
        $('#dist10').click();
      } else if (jogdistXYZ == 10) {
        $('#dist100').click();
      } else {
        $('#dist1').click();
      }
    }
  });

});
