document.addEventListener("DOMContentLoaded", () => {
  fetch("/components/header.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("common-header").innerHTML = html;

      fetch("/auth/me")
        .then(res => {
          if (!res.ok) throw new Error("Not logged in");
          return res.json();
        })
        .then(data => {
          const welcome = document.getElementById("welcomeUser");
          if (data.user && data.user.name) {
            welcome.textContent = `${data.user.name}님 환영합니다!`;
          }
        })
        .catch(() => {
          // 비로그인 시 텍스트 숨김 & 버튼 숨김
          const welcome = document.getElementById("welcomeUser");
          const logoutBtn = document.querySelector(".logout-btn");
          if (welcome) welcome.style.display = "none";
          if (logoutBtn) logoutBtn.style.display = "none";
        });
    });
});

// ✅ 모든 페이지에서 작동하게 만드는 로그아웃 함수
async function logout() {
  await fetch("/auth/logout", { method: "POST", credentials: "include" });
  alert("로그아웃 되었습니다.");
  location.href = "/index.html"; // 또는 로그인 페이지로 리디렉션
}