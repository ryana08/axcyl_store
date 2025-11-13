fetch("/html-pages/navbar.html")
  .then(res => res.text())
  .then(html => {
    document.querySelector("#navbar-placeholder").outerHTML = html;

    const menuIcon = document.querySelector('.menu-icon-overlay');
    const sidebar = document.querySelector('.sidebar');

    menuIcon.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  });

  fetch("/html-pages/footer.html")
    .then(res => res.text())
    .then(html => {
        document.querySelector("#footer-placeholder").outerHTML = html;
    })