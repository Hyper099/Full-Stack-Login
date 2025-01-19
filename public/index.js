
getUserInformation()

//!Handling button clicks.
document.getElementById('signup-button').addEventListener('click', () => {
   signUp();
})
document.getElementById('signin-button').addEventListener('click', () => {
   signIn();
})
document.getElementById('logout-button').addEventListener('click', () => {
   logOut();
})


//? async function so that the process cannot be stopped if the backend is taking time.
async function signUp() {
   const usernameField = document.getElementById('signup-username');
   const username = usernameField.value;
   const passwordField = document.getElementById('signup-password');
   const password = passwordField.value;

   try {
      await axios.post('http://localhost:3000/signup', {
         username,
         password
      });

      alert('User signed up successfully!');
      usernameField.value = '';
      passwordField.value = '';
   } catch (error) {
      if (error.response && error.response.status === 409) {
         // Handle conflict error when username already exists
         alert('Username already exists. Please choose a different username.');
      } else {
         // Handle other errors
         console.error("An error occurred during sign up:", error);
         alert('An error occurred. Please try again later.');
      }
   }
}


//!Async function for signing in.
async function signIn() {
   const usernameField = document.getElementById('signin-username');
   const username = usernameField.value;
   const passwordField = document.getElementById('signin-password');
   const password = passwordField.value;

   try {
      const response = await axios.post('http://localhost:3000/signin', {
         username,
         password
      });

      localStorage.setItem("token", response.data.token); // Save the token in localStorage
      alert('User signed in successfully!');
      usernameField.value = '';
      passwordField.value = '';
      getUserInformation(); // Fetch and display user information
   } catch (error) {
      if (error.response && error.response.status === 404) {
         // Handle incorrect credentials
         alert('Incorrect credentials. Please try again.');
      } else {
         // Handle other errors
         console.error("An error occurred during sign in:", error);
         alert('An error occurred. Please try again later.');
      }
   }
}


async function getUserInformation() {
   const token = localStorage.getItem("token");

   if (token) {
      try {
         const response = await axios.get('http://localhost:3000/me', {
            headers: {
               token: token
            }
         });
         document.getElementById('information').innerHTML = `username: ${response.data.username}, password: ${response.data.password}`;
      } catch (error) {
         console.error("Error fetching user information:", error);
         document.getElementById('information').innerHTML = "Error fetching user information.";
      }
   } else {
      document.getElementById('information').innerHTML = "No user is logged in.";
   }
}


function logOut() {
   localStorage.clear();
   document.getElementById('information').innerHTML = "You have logged out.";
}