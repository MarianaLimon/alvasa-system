const bcrypt = require('bcrypt');

const password = process.argv[2]; // lo que pases por consola
if (!password) {
  console.error("❌ Necesitas pasar la contraseña como argumento");
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log("Hash generado:");
  console.log(hash);
});
