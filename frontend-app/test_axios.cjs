const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('http://localhost:8000/login', {
      email: 'fariz@email.com',
      password: 'password'
    });
    console.log("SUCCESS:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("ERROR RESPONSE:", error.response.status);
      console.log("ERROR DATA:", error.response.data);
      console.log("ERROR HEADERS:", error.response.headers);
    } else {
      console.log("NETWORK ERROR:", error.message);
    }
  }
}

test();
