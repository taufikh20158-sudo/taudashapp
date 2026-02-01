document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (userIn === "taufik" && passIn === "hidayat") {
        // SIMPAN KUNCI DISINI
        localStorage.setItem('isLoggedIn_2026', 'true');
        
        window.location.replace("index.html"); 
    } else {
        errorMsg.style.display = "block";
    }
});
