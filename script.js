let i = 0;
let txt = 'raymarth';
let speed = 200;


window.onload = function() {

  AOS.init();
  typeWriter();

  function typeWriter() {
    if (i < txt.length) {
      document.getElementById("typewrite").innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
}
