const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');


document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault(); // Evita que el form se envíe automáticamente

  if (this.checkValidity()) {
    const email = document.getElementById('email').value;
    alert(`¡Registro exitoso!\n\nSe ha enviado un mensaje de confirmación a: ${email}.\nPor favor, verifica tu bandeja de entrada para activar tu cuenta.`);

    window.location.href = "index-login.html";
  } else {
    this.reportValidity();
  }
});

document.getElementById('email').addEventListener('input', function () {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.pe$/;

    if (!regex.test(this.value)) {
        this.setCustomValidity("El correo debe terminar en .edu.pe");
    } else {
        this.setCustomValidity("");
    }
});

document.getElementById('password').addEventListener('input', function () {
    const password = this.value;

    if (password.length < 8) {
        this.setCustomValidity("La contraseña debe tener al menos 8 caracteres.");
    } else {
        this.setCustomValidity("");
    }
});

confirmPasswordInput.addEventListener('input', validarCoincidencia);

function validarCoincidencia() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword !== password) {
        confirmPasswordInput.setCustomValidity("Las contraseñas no coinciden.");
    } else {
        confirmPasswordInput.setCustomValidity("");
    }
}