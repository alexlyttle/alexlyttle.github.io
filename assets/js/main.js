// // Alex Lyttle, 9 Jan 2021
// // Button function (onClick) to show or hide an element with a given "abstract_id"
function show_abstract(abstract_id, btn) {
	const x = document.getElementById(abstract_id);
	if (x.style.display !== "none") {
	  x.style.display = "none";
	//   btn.innerHTML = "expand_less";
	} else {
	  x.style.display = "block";
	//   btn.innerHTML = "expand_more";
	}

}

const smallWidth = 700;
const marginLeft = "200px";
const marginLeftZeropoint = "0px";

const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

const menuToggle = document.getElementById("menu-icon");
const themeToggle = document.getElementById("theme-icon");
const navbar = document.getElementById("navbar");
const navElements = document.getElementsByClassName("navlink");
const content = document.getElementById("content");

function showNavbar() {
	navbar.style.visibility = "visible";
	navbar.style.opacity = 1;
	menuToggle.textContent = "close";
	// Only adjust margin-left if window width is large
	if (window.innerWidth > smallWidth) {content.style.marginLeft = marginLeft}
}

function hideNavbar() {
	navbar.style.visibility = "hidden";
	navbar.style.opacity = 0;
	menuToggle.textContent = "menu";
	if (window.innerWidth > smallWidth) {content.style.marginLeft = marginLeftZeropoint}
}

// Show or hide navbar
function toggleNavbar() {
	if (navbar.style.visibility === "hidden") {showNavbar()} else {hideNavbar()}
}

// Toggle between dark and light theme
function toggleTheme() {
	if (prefersDarkTheme.matches) {
		if (document.body.classList.contains("light-theme")) {
	  		document.body.classList.remove("light-theme");
			themeToggle.textContent = "light_mode";
		} else {
			document.body.classList.add("light-theme");
			themeToggle.textContent = "dark_mode";
		}
	} else {
		if (document.body.classList.contains("dark-theme")) {
			document.body.classList.remove("dark-theme");
		  themeToggle.textContent = "dark_mode";
	  } else {
		  document.body.classList.add("dark-theme");
		  themeToggle.textContent = "light_mode";
	  }
	}
}

// Sets theme depending on the user's preference (TODO: add save/load theme)
// E.g. save prefersDarkTheme (system settings) and then override with user preference
function setTheme() {	
	if (prefersDarkTheme.matches) {
		themeToggle.textContent = "light_mode";
	} else {
		themeToggle.textContent = "dark_mode";
	}
}

// Add margin to main content when window size changes
function resizeContent() {
	if (window.innerWidth > smallWidth) {
		// Only resize margin if navbar is visible
		if (navbar.style.visibility === "visible") {content.style.marginLeft = marginLeft}
	} else {
		content.style.marginLeft = marginLeftZeropoint;
	}
}

function hideNavbarIfSmall() {
	if (window.innerWidth < smallWidth) {hideNavbar()}
}

function onLoad() {
	setTheme();
	if (window.innerWidth < smallWidth) {hideNavbar()}
	const splash = document.getElementById("splash");
	splash.style.visibility = "hidden";
	splash.style.opacity = 0;
}

window.addEventListener('resize', resizeContent)
prefersDarkTheme.addEventListener('change', setTheme)  // If user changes system theme, update theme

for (let i = 0; i < navElements.length; i++) {
    navElements[i].addEventListener('click', hideNavbarIfSmall, false);
}

// // Alex Lyttle, 10 Jan 2021
// // Counts characters in a text area
const textarea = document.getElementById("form-textarea");
const messageCount = document.getElementById("message-count");

textarea.addEventListener("input", event => {
	const maxLength = textarea.getAttribute("maxlength");
	const currentLength = textarea.value.length;

	if (currentLength >= maxLength) {
		return console.log("Maximum character length reached");
	}
	const message = `${maxLength - currentLength} characters remaining`
	messageCount.innerHTML = message;
	console.log(message);	
});

function toggleOthers(othersID, btn) {
	const x = document.getElementById(othersID);
	if (x.style.display === "none") {
	  x.style.display = "inline";
	  btn.innerHTML = "hide others";
	} else {
	  x.style.display = "none";
	  btn.innerHTML = "et al.";
	}
}