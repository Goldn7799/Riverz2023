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
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
const provider = new GoogleAuthProvider();
const root = document.getElementById("root");
const devMode = false;
let webMode = "light"
//End Setup

//Variable Setup
let API, data = {}, dataUser = {}, providerId, names, globalChatActived, homeActivated, userUpdate = false, userIDS=0, userCIDS=0, dataC = {};
//End Variable Setup

//Check
const auth = getAuth();
const db = getDatabase();
onAuthStateChanged(auth, (user)=>{
  if(user){
    user.providerData.map((datas)=>{
      providerId = datas.providerId;
    })
    if(user.emailVerified){
      if (providerId === "google.com"){
        data = {
          "Username": user.displayName,
          "Id": user.email.substring(0, user.email.length - 10),
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
          "Id": email.substring(0, email.length - 10),
          "Email": user.email,
          "Photo": "./src/assets/profile.png"
        }
      }
      const rAPI = ref(db, "global/api");
      onValue(rAPI, (resData)=>{
        if(devMode){
          API = "http://localhost:3000"
        }else {
          API = resData.val();
        }
        fetch(`${API}/RiverzUser`, { method: "GET" }).then(ress=>{ return ress.json() }).then(res=>{
          dataUser = res;
          dataUser.map(dts=>{
            userCIDS++;
            if(dts.id === data.Id){
              userUpdate = true;
              userIDS = userCIDS-1;
              dataC = dts;
            };
          })
          if(!userUpdate){
            fetch(`${API}/RiverzRequest`, {
              method: 'POST', // or 'PUT'
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                "avabile": false,
                "edit": false,
                "profile": data.Photo,
                "name": data.Username,
                "text": "",
                "id": data.Id,
                "date": ""
              })
            })
              .then((response) => { return response.json() })
              .then((datas) => {
                console.log("SUCCES Load")
                // console.log('Success:', data);
              })
              .catch((error) => {
                // alert("Error", error)
                Notipin.Alert({
                  msg: `Error : ${error}`, // Pesan kamu
                  yes: "OKEH", // Tulisan di tombol 'Yes'
                  onYes: () => { /* Kode di sini */ },
                  type: "DANGER",
                  mode: webMode
                })
                // console.error('Error:', error);
            });
          }else {
            data.Username = dataC.name;
          }
        }).catch(err=>{ 
          Notipin.Alert({
          msg: `Server Closed`, // Pesan kamu
          yes: "OKEH", // Tulisan di tombol 'Yes'
          onYes: () => { /* Kode di sini */ },
          type: "DANGER",
          mode: webMode
        }) })
        Page.Home();
      });
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
    Notipin.Alert({
      msg: `${errorMessage}`, // Pesan kamu
      yes: "OKEH", // Tulisan di tombol 'Yes'
      onYes: () => { /* Kode di sini */ },
      type: "NORMAL",
      mode: webMode
    })
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
    Notipin.Alert({
      msg: `${errorMessage}`, // Pesan kamu
      yes: "OKEH", // Tulisan di tombol 'Yes'
      onYes: () => { /* Kode di sini */ },
      type: "NORMAL",
      mode: webMode
    })
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
    Notipin.Alert({
      msg: `${error}`, // Pesan kamu
      yes: "OKEH", // Tulisan di tombol 'Yes'
      onYes: () => { /* Kode di sini */ },
      type: "NORMAL",
      mode: webMode
    })
  });
}

const SendEmailVerify = ()=>{
  sendEmailVerification(auth.currentUser).then(()=>{
    Notipin.Alert({
      msg: `Email Verify Sent`, // Pesan kamu
      yes: "OKEH", // Tulisan di tombol 'Yes'
      onYes: () => { /* Kode di sini */ },
      type: "INFO",
      mode: webMode
    })
  }).catch((err)=>{ 
    Notipin.Alert({
      msg: `${err}`, // Pesan kamu
      yes: "OKEH", // Tulisan di tombol 'Yes'
      onYes: () => { /* Kode di sini */ },
      type: "NORMAL",
      mode: webMode
    })
  })
}

const logOut = () => {
  
  Notipin.Confirm({
    msg: "Yakin Ingin LogOut?", // Pesan kamu
    yes: "IYA", // Tulisan di tombol 'Yes'
    no: "NGGA", // Tulisan di tombol 'No'
    onYes: () => { signOut(auth) },
    onNo: () => { /* Kode di sini */ },
    type: "DANGER",
    mode: webMode,
  })
};

const EditName = ()=>{
  Notipin.Prompt({
  msg: "Masukkan Nama Baru", // Pesan kamu
  placeholder: "Contoh 'Yusril GG'",
  max: 0, // Maksimal karakter (integer)
  textarea: false, // tag element (boolean)
  yes: "Next", // Tulisan di tombol 'Yes'
  no: "BATAL", // Tulisan di tombol 'No'
  onYes: (res) => { 
    let names = res;
    if(names&&!names.includes("<")&&!names.includes(">")){
      fetch(`${API}/RiverzRequest`, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "avabile": false,
          "edit": userIDS,
          "profile": data.Photo,
          "name": names,
          "text": "",
          "id": data.Id,
          "date": ""
        })
      })
        .then((response) => { return response.json() })
        .then((datas) => {
          // alert("Sukses Ganti Nama");
          Notipin.Alert({
            msg: "Sukses Ganti Nama", // Pesan kamu
            yes: "OKE", // Tulisan di tombol 'Yes'
            onYes: () => { /* Kode di sini */ },
            type: "INFO",
            mode: webMode,
          })
          setTimeout(() => {
            window.location.reload();
          }, 500);
          // console.log('Success:', data);
        })
        .catch((error) => {
          // alert("Gagal Mengubah Nama", error)
          Notipin.Alert({
            msg: `Gagal Mengubah Nama ${error}`, // Pesan kamu
            yes: "OKEH", // Tulisan di tombol 'Yes'
            onYes: () => { /* Kode di sini */ },
            type: "DANGER",
            mode: webMode,
          })
          // console.error('Error:', error);
      });
    }else{
      // alert("NAMA KOSONG ATAU MENGANDUNG KARAKTER ILEGAL < or >")
      Notipin.Alert({
        msg: "NAMA KAMU KOSONG ATAU MENGANDUNG KARAKTER ILEGAL SEPERTI < ATAU >", // Pesan kamu
        yes: "OKE", // Tulisan di tombol 'Yes'
        onYes: () => { /* Kode di sini */ },
        type: "DANGER",
        mode: webMode,
      })
    }
  },
  onNo: (res) => { /* Kode di sini */ },
  type: "BLUE",
  mode: webMode,
  })
  
}
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
    homeActivated = false;
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
    homeActivated = true;
    const homesSC = ()=>{
      if(homeActivated){
        document.getElementById("usernameDisplay").innerText = data.Username;
        setTimeout(()=>{ homesSC(); }, 250)
      };
    }
    root.innerHTML = `<center>LOGED IN
    <button onClick="logOut()">LogOut</button>
    <button onClick="global()">Global Chat</button>
    <button onClick="editname()">Edit Name</button></center>
    <center id="homeInfo"><img class="potho" src="${data.Photo}" >
    <p id="usernameDisplay">Loading...</p></center>`
    homesSC();
  },
  "Verify": ()=>{
    homeActivated = false;
    root.innerHTML = `<button onClick="SendEmailVerify()">Send Email Verify Link</button>`
  },
  "GlobalChat": ()=>{
    homeActivated = false;
    globalChatActived = true;
    fetch(`${API}/RiverzUser`, { method: "GET" }).then(ress=>{ return ress.json() }).then(res=>{
      dataUser = res;
    }).catch(err=>{
      Notipin.Alert({
        msg: `Server Closed : ${err}`, // Pesan kamu
        yes: "OKEH", // Tulisan di tombol 'Yes'
        onYes: () => { /* Kode di sini */ },
        type: "DANGER",
        mode: webMode
      }) 
      Page.Home(); 
    })
    root.innerHTML = `<h1>Global Chat</h1><button onClick="home()">Back</button><button id="chatsCount">0 Chats</button>
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
    <table id="tableSend">
      <tr>
        <td><div id="sendD"><button id="send" onClick="sendText(document.getElementById('textChat').value)">Send</button></div></td>
        <td><input type="text" id="textChat" name="chat" placeholder="Texts"></td>
        <td><button class="down" onClick="globalScrollChat()">Down</button></td>
      </tr>
    </table>
    `
    // document.getElementById("tableSend").style.width = `${screen.width/2}px`
    const chat = document.getElementById("chat");
    let cacheChat, currentChat, anotherUserProfile, chatsCount, anotherUserName, chatsId;
    const sendText = (text)=>{
      let dates = Date();
      if (text&&(!text.includes("<"))&&(!text.includes(">"))){
        document.getElementById("sendD").innerHTML = `<button id="send" style="background-color: blue;">Send</button>`
        fetch(`${API}/RiverzRequest`, {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "avabile": true,
            "text": text,
            "id": data.Id,
            "date": dates.substring(16, 25)
          })
        })
          .then((response) => response.json())
          .then((datas) => {
            document.getElementById("textChat").value = "";
            document.getElementById("sendD").innerHTML = `<button id="send" onClick="sendText(document.getElementById('textChat').value)">Send</button>`
            // console.log('Success:', data);
          })
          .catch((error) => {
            document.getElementById("sendD").innerHTML = `<button id="send" onClick="sendText(document.getElementById('textChat').value)">Send</button>`
            Notipin.Alert({
              msg: `Error : ${error}`, // Pesan kamu
              yes: "OKEH", // Tulisan di tombol 'Yes'
              onYes: () => { /* Kode di sini */ },
              type: "DANGER",
              mode: webMode
            })
            // console.error('Error:', error);
          });
      }else {
        // alert("Chat Kosong/mengandung huruf ilagal seperi <,>")
        Notipin.Alert({
          msg: "Chat Kosong/mengandung huruf ilagal seperi <,>", // Pesan kamu
          yes: "OKE", // Tulisan di tombol 'Yes'
          onYes: () => { /* Kode di sini */ },
          type: "INFO",
          mode: webMode,
        })
      }
    }
    const delChat = (arrayId)=>{
      if(arrayId){
        Notipin.Confirm({
          msg: "Yakin Ingin Delete Chat?", // Pesan kamu
          yes: "Iya", // Tulisan di tombol 'Yes'
          no: "Ngga", // Tulisan di tombol 'No'
          onYes: () => { fetch(`${API}/RiverzRequest`, {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "avabile": "DEL",
            "text": arrayId,
            "id": data.Id
          })
        })
          .then((response) => response.json())
          .then((datas) => {
            Notipin.Alert({
              msg: `Sukses Delete Chat`, // Pesan kamu
              yes: "OKEH", // Tulisan di tombol 'Yes'
              onYes: () => { /* Kode di sini */ },
              type: "NORMAL",
              mode: webMode
            })
            // console.log('Success:', data);
          })
          .catch((error) => {
            Notipin.Alert({
              msg: `Error : ${error}`, // Pesan kamu
              yes: "OKEH", // Tulisan di tombol 'Yes'
              onYes: () => { /* Kode di sini */ },
              type: "DANGER",
              mode: webMode
            })
            // console.error('Error:', error);
          }); },
          onNo: () => { /* Kode di sini */ },
          type: "BLUE",
          mode: webMode
        })
        
      };
    }
    const globalScrollChat = ()=>{
      chat.scrollTop = chat.scrollHeight
    }
    const update = ()=>{
      cacheChat = ``;
      chatsCount = 0;
      chatsId = 0;
      if(globalChatActived){
        fetch(`${API}/RiverzChat`, {method: "GET"}).then(ress => { return ress.json() }).then(res =>{
          res.map(datas => {
            anotherUserProfile = "";
            chatsCount++;
            chatsId++;
            dataUser.map(dt=>{
              if (dt.id === datas.id){
                anotherUserProfile = dt.profile;
                anotherUserName = dt.name;
              }
            })
            cacheChat += `<p><img class="profileChat" src="${(anotherUserProfile) ? anotherUserProfile : "./src/assets/profile.png"}">${(anotherUserName) ? anotherUserName : "NoName"} |${(datas.id === data.Id) ? ` <button onClick="delChat('${chatsId-1}')">DEL</button> |` : ``} ${datas.date}=> ${datas.text}</p>`
          });
          setTimeout(() => {
            if(currentChat !== cacheChat&&chatsCount > 6){
              chat.innerHTML = cacheChat;
              document.getElementById("chatsCount").innerHTML = `${chatsCount} Chat Loaded`;
              currentChat = cacheChat;
              chat.scrollTop = chat.scrollHeight;
            };
            setTimeout(()=>{
              update()
            }, 100)
          }, 250);
          }).catch((err)=>{
            chat.innerHTML = err
            setTimeout(()=>{
              update()
            }, 2500)
        })
      };
    }
    update();
    window.sendText = sendText;
    window.delChat = delChat;
    window.globalScrollChat = globalScrollChat;
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
window.editname = EditName;
//Page
window.login = Page.Login;
//End Export

loader.dotSpinner();