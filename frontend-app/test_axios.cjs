const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:8000/login', {
      email: 'fariz@email.com',
      password: 'wrong'
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("HTTP ERROR:", err.response.status, err.response.data);
      console.log("HEADERS:", err.response.headers);
    } else {
      console.log("NETWORK ERROR:", err.message);
    }
  }
}

test();
