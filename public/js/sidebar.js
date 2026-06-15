document.addEventListener("DOMContentLoaded", function(){

    const role = document.body.getAttribute("data-role");

    let sidebarFile = "../components/sidebar.html"; // default admin

    if(role === "mhs"){
        sidebarFile = "../../components/sidebar_mhs.html";
    }

    fetch(sidebarFile)
    .then(res => res.text())
    .then(data => {
        document.getElementById("sidebar").innerHTML = data;

        lucide.createIcons();
        setActiveMenu();
    });

});

function setActiveMenu(){

    const currentPage = document.body.getAttribute("data-page");

    const menuItems = document.querySelectorAll(".menu li, .bottom li");

    menuItems.forEach(item => {

        item.classList.remove("active");

        if(item.getAttribute("data-menu") === currentPage){
            item.classList.add("active");
        }

    });

}