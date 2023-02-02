//SetUp
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification
  } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
const provider = new GoogleAuthProvider();
const root = document.getElementById("root");
const API = "http://0.tcp.ap.ngrok.io:16420"
//End Setup

//Variable Setup
let data = {}, providerId, names, globalChatActived;
//End Variable Setup

//Check
const auth = getAuth();
onAuthStateChanged(auth, (user)=>{
  if(user){
    user.providerData.map((data)=>{
      providerId = data.providerId;
    })
    if(user.emailVerified){
      if (providerId === "google.com"){
        data = {
          "Username": user.displayName,
          "Email": user.email,
          "Photo": user.photoURL
        }
      }else {
        let email = user.email;
        if(email.substring(email.length - 10) === "@gmail.com"||email.substring(email.length - 10) === "@yahoo.com"){
          names = email.substring(0, email.length - 10);
        }else {
          names = email;
        }
        data = {
          "Username": names,
          "Email": user.email,
          "Photo": "./src/assets/profile.png"
        }
      }
      Page.Home();
    }else {
      Page.Verify();
    }
    // localStorage.setItem("auth", "true")
  }else {
    Page.Login()
    console.log("LOGED OUT")
    // localStorage.setItem("auth", "false")
  }
})
//End Check

//Auth
const GoogleLogin = ()=>{
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    alert(errorMessage)
    // ...
  });
}

const EmailLogin = (email, password)=>{
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
  });
}

const EmailRegister = (email, password)=>{
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
    alert(errorMessage)
  });
}

const SendEmailVerify = ()=>{
  sendEmailVerification(auth.currentUser).then(()=>{
    alert("email verify Sent")
  }).catch((err)=>{ alert(err.message) })
}

const logOut = () => signOut(auth);
//end Auth

//Loader
const loader = {
  "dotSpinner": ()=>{
    root.innerHTML = `<center class="loading"><div class="dot-spinner">
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
    <div class="dot-spinner__dot"></div>
  </div></center>`
  }
}
//End Loader

//Page
const Page = {
  "Login": ()=>{
    root.innerHTML = `<button onClick="emailPage()">Login With Email</button>
    <button onClick="GoogleLogin()">Login With Google</button>`;

    const emailPage = ()=>{
      root.innerHTML = `EmailLogin<button onClick="login()">Back</button>
      <button onClick="registerPage()">Register</button>
      <form>
        <input type="email" id="email" name="email" placeholder="Email">
        <input type="password" id="password" name="password" placeholder="Password">
      </form>
      <button onClick="EmailLogin(document.getElementById('email').value, document.getElementById('password').value)">Login</button>`;
    }
    const registerPage = ()=>{
      root.innerHTML = `Register <button onClick="emailPage()">Back</button>
      <form>
        <input type="email" id="email" name="email" placeholder="Email">
        <input type="password" id="password" name="password" placeholder="Password">
      </form>
      <button onClick="EmailRegister(document.getElementById('email').value, document.getElementById('password').value)">Register</button>`;
    }
    window.emailPage = emailPage;
    window.registerPage = registerPage;
  },
  "Home": ()=>{
    globalChatActived = false;
    root.innerHTML = `LOGED IN
    <button onClick="logOut()">LogOut</button>
    <button onClick="global()">Global Chat</button>
    <div><img class="potho" src="${data.Photo}" >
    <p>${data.Username}</p></div>`
  },
  "Verify": ()=>{
    root.innerHTML = `<button onClick="SendEmailVerify()">Send Email Verify Link</button>`
  },
  "GlobalChat": ()=>{
    globalChatActived = true;
    root.innerHTML = `<h1>Global Chat</h1><button onClick="home()">Back</button>
    <div id="chat"><center><div class="jelly"></div>

    <svg width="0" height="0" class="jelly-maker">
      <defs>
        <filter id="uib-jelly-ooze">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="6.25"
            result="blur"
          />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="ooze"
          />
          <feBlend in="SourceGraphic" in2="ooze" />
        </filter>
      </defs>
    </svg></center></div>
    <table class="tableSend">
      <tr>
        <td><input type="text" id="textChat" name="chat" placeholder="Texts"></td>
        <td><div id="sendD"><button id="send" onClick="sendText(document.getElementById('textChat').value)">Send</button></div></td>
      </tr>
    </table>
    `
    const chat = document.getElementById("chat");
    let cacheChat, currentChat;
    const sendText = (text)=>{
      let dates = Date();
      if (text){
        document.getElementById("sendD").innerHTML = `<button id="send" style="background-color: blue;">Send</button>`
      fetch(`${API}/RiverzRequest`, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "avabile": true,
          "text": text,
          "sender": data.Username,
          "date": dates.substring(16, 25)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("textChat").value = "";
          document.getElementById("sendD").innerHTML = `<button id="send" onClick="sendText(document.getElementById('textChat').value)">Send</button>`
          // console.log('Success:', data);
        })
        .catch((error) => {
          alert("Error", error)
          // console.error('Error:', error);
      });
      }else {
        alert("Chat Kosong")
      }
    }
    const update = ()=>{
      cacheChat = ``;
      if(globalChatActived){
        fetch(`${API}/RiverzChat`, {method: "GET"}).then(ress => { return ress.json() }).then(res =>{
          res.map(data => {
            cacheChat += `<p>${data.sender} | ${data.date}=> ${data.text}</p>`
          });
          chat.innerHTML = cacheChat;
          if(currentChat !== cacheChat){
            chat.scrollTop = chat.scrollHeight
            currentChat = cacheChat;
          };
          setTimeout(()=>{
            update()
          }, 250)
          }).catch((err)=>{
            chat.innerHTML = err
            setTimeout(()=>{
              update()
            }, 5000)
        })
      };
    }
    update();
    window.sendText = sendText;
  }
}
//End Page

//Export
// export { GoogleLogin, logOut };
window.GoogleLogin = GoogleLogin;
window.EmailLogin = EmailLogin;
window.EmailRegister = EmailRegister;
window.SendEmailVerify = SendEmailVerify;
window.home = Page.Home;
window.global = Page.GlobalChat;
window.logOut = logOut;
//Page
window.login = Page.Login;
//End Export

loader.dotSpinner();