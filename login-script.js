document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    // Data User yang Anda minta
    const validUser = "taufik";
    const validPass = "hidayat";

    if (userIn === validUser && passIn === validPass) {
        // MEMBERIKAN TIKET MASUK
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userActive', userIn);
        // Efek transisi sukses
        document.querySelector('.login-card').style.transform = "scale(0.9)";
        document.querySelector('.login-card').style.opacity = "0";
        
        setTimeout(() => {
            window.location.href = "index.html"; // Sambung ke project utama
        }, 500);
    } else {
        errorMsg.style.display = "block";
        // Reset input password jika salah
        document.getElementById('password').value = "";
    }
});
