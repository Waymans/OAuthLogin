const messU = document.getElementById('messU');
const signUp = document.getElementById('sign-up');
const pass1 = document.getElementById('pass1');
const pass2 = document.getElementById('pass2');
const messP = document.getElementById('messP');
const user = document.getElementById('user');
const modal = document.getElementById('mod');
const modal2 = document.getElementById('mod2');
var m1 = 'what';
  
// modal for sign-up
document.getElementById('modal').addEventListener('click', () => {
  modal.style.display = 'block';
});
document.getElementById('cancel').addEventListener('click', () => {
  modal.style.display = 'none';
});
// modal for login
document.getElementById('login').addEventListener('click', () => {
  modal2.style.display = 'block';
})
document.getElementById('cancel2').addEventListener('click', () => {
  modal2.style.display = 'none';
});
// closes modal
window.onclick = function(event) {
  if (event.target == modal) {modal.style.display = "none";}
  if (event.target == modal2) {modal2.style.display = "none";}
}

/* sign up changes */
// usernames
let obj;
fetch('/users')
  .then((resp) => resp.json())
  .then(function(data) {
    obj = data;
  })
  .catch(function(error) {
  console.log(error);
});

// compare usernames
user.addEventListener('keyup', e => {
  e.preventDefault();
  if (obj.find(x=>x.username===user.value)) { 
    messU.innerHTML = 'This username is already taken.';
  } else {
    messU.innerHTML = '';
  } 
  test();
});

// compare passwords
pass2.addEventListener('keyup', e => {
  e.preventDefault();
  if (pass2.value === pass1.value) {
    messP.innerHTML = 'Match.';
    messP.setAttribute('class', 'text-green');
  } else {
    messP.innerHTML = 'Don\'t match.';
    messP.setAttribute('class', 'text-red');
  }
  test();
})

// submit button changes
function test() {
  if (messU.innerHTML === '' && messP.innerHTML === 'Match.') {
    document.getElementById("sub").disabled = false;
  } else {
    document.getElementById("sub").disabled = true;
  }
}