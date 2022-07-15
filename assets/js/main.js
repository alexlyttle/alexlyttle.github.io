// // Alex Lyttle, 9 Jan 2021
// // Button function (onClick) to show or hide an element with a given "abstract_id"
// function show_abstract(abstract_id, btn) {
// 	var x = document.getElementById(abstract_id);
// 	if (x.style.display === "none") {
// 	  x.style.display = "block";
// 	  btn.innerHTML = "Hide abstract";
// 	} else {
// 	  x.style.display = "none";
// 	  btn.innerHTML = "Show abstract";
// 	}
// }

// // Alex Lyttle, 10 Jan 2021
// // Counts characters in a text area
// $('textarea').keyup(function() {
    
// 	var characterCount = $(this).val().length,
// 		current = $('#current'),
// 		maximum = $('#maximum'),
// 		theCount = $('#the-count');
	  
// 	current.text(characterCount);
// });

const small_width = 700;
const margin_left = "200px";
const margin_left_zeropoint = "0px";
const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

var content = document.getElementById("content");
var navbar = document.getElementById("navbar");
var theme_toggle = document.getElementById("theme-icon");
var nav_elements = document.getElementsByClassName("navlink")
var menu_toggle = document.getElementById("menu-icon");

function showNavbar() {
	navbar.style.visibility = "visible";
	navbar.style.opacity = 1;
	menu_toggle.textContent = "close";
	// Only adjust margin-left if window width is large
	if (window.innerWidth > small_width) {content.style.marginLeft = margin_left}
}

function hideNavbar() {
	navbar.style.visibility = "hidden";
	navbar.style.opacity = 0;
	menu_toggle.textContent = "menu";
	if (window.innerWidth > small_width) {content.style.marginLeft = margin_left_zeropoint}
}

// Show or hide navbar
function toggleNavbar() {
	if (navbar.style.visibility === "hidden") {
		showNavbar()
	} else {
		hideNavbar()
	}
}

// Toggle between dark and light theme
function toggleTheme() {
	if (prefersDarkTheme.matches) {
		if (document.body.classList.contains("light-theme")) {
	  		document.body.classList.remove("light-theme");
			theme_toggle.textContent = "light_mode";
		} else {
			document.body.classList.add("light-theme");
			theme_toggle.textContent = "dark_mode";
		}
	} else {
		if (document.body.classList.contains("dark-theme")) {
			document.body.classList.remove("dark-theme");
		  theme_toggle.textContent = "dark_mode";
	  } else {
		  document.body.classList.add("dark-theme");
		  theme_toggle.textContent = "light_mode";
	  }
	}
}

// Sets theme depending on the user's preference (TODO: add save/load theme)
// E.g. save prefersDarkTheme (system settings) and then override with user preference
function setTheme() {	
	if (prefersDarkTheme.matches) {
		theme_toggle.textContent = "light_mode";
	} else {
		theme_toggle.textContent = "dark_mode";
	}
}

// Add margin to main content when window size changes
function resizeContent() {
	if (window.innerWidth > small_width) {
		// Only resize margin if navbar is visible
		if (navbar.style.visibility === "visible") {content.style.marginLeft = margin_left}
	} else {
		content.style.marginLeft = margin_left_zeropoint;
	}
}

function hideNavbarIfSmall() {
	if (window.innerWidth < small_width) {hideNavbar()}
}

function onLoad() {
	setTheme();
	if (window.innerWidth < small_width) {hideNavbar()}
	var splash = document.getElementById("splash");
	splash.style.visibility = "hidden";
	splash.style.opacity = 0;
}

window.addEventListener('resize', resizeContent)
prefersDarkTheme.addEventListener('change', setTheme)  // If user changes system theme, update theme

for (var i = 0; i < nav_elements.length; i++) {
    nav_elements[i].addEventListener('click', hideNavbarIfSmall, false);
}
