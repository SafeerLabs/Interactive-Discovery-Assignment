
// I keep everything the player has done in one object and save it in localStorage so it is remembered between pages.

var SAVE_KEY = "curiousCaseSave";

function getNewGame() {
  return {
    name: "",
    clues: [],          // ids of clues found
    visited: [],        // pages the player has been to
    hasKey: false,      // brass key from the workshop clock
    shedOpen: false,
    talkedToMartha: false,
    lastAccused: ""
  };
}

function loadGame() {
  var saved = localStorage.getItem(SAVE_KEY);
  if (saved === null) {
    return getNewGame();
  }
  return JSON.parse(saved);
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

var game = loadGame();

// ---------- 2. All the clues in the story ----------
var allClues = {
  diary: {
    title: "Torn diary page",
    text: "\"Victor keeps asking where I keep the blueprints. I have hidden the attic key where time stands still.\""
  },
  code: {
    title: "Scratched numbers",
    text: "Behind the painting someone scratched: 4 - 1 - 7"
  },
  gear: {
    title: "Engraved gear",
    text: "A half-made gear stamped with the letters V.C. (Victor Crane, the apprentice?)"
  },
  witness: {
    title: "Martha's story",
    text: "Martha saw Victor sneaking out of the shed at midnight with a lantern."
  },
  boots: {
    title: "Muddy boots",
    text: "Boots hidden in the shed, size 11, with V.C. written inside. Gravel from the garden path is stuck in the soles."
  },
  letter: {
    title: "Elias's letter",
    text: "\"Victor wants to sell my invention. I have gone to hide at the old lighthouse. Trust no one.\""
  }
};

var TOTAL_CLUES = 6;

// nice names for the visited list
var pageNames = {
  index: "Front Door",
  study: "The Study",
  workshop: "The Workshop",
  garden: "The Garden",
  attic: "The Attic",
  accuse: "The Accusation"
};

// ---------- 3. Helper functions ----------

function hasClue(id) {
  return game.clues.indexOf(id) !== -1;
}

function addClue(id) {
  if (hasClue(id)) {
    return; // already have it, do nothing
  }
  game.clues.push(id);
  saveGame();
  updateNotebook();
  showToast("New clue: " + allClues[id].title);
}

function showPopup(title, text) {
  document.getElementById("popup-title").textContent = title;
  document.getElementById("popup-text").innerHTML = text;
  document.getElementById("popup").classList.add("show");
}

function closePopup() {
  document.getElementById("popup").classList.remove("show");
}

function showToast(message) {
  var toast = document.getElementById("clue-toast");
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  // hide it again after 3 seconds
  setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

// adds a tick to a hotspot so the player knows they checked it
function markChecked(id) {
  document.getElementById(id).classList.add("checked");
}

function updateNotebook() {
  var clueList = document.getElementById("clue-list");
  if (!clueList) {
    return; // this page has no notebook
  }

  document.getElementById("detective-name").textContent = game.name || "Unknown";
  document.getElementById("clue-count").textContent = game.clues.length;

  var percent = (game.clues.length / TOTAL_CLUES) * 100;
  document.getElementById("progress-fill").style.width = percent + "%";

  // list of clues
  clueList.innerHTML = "";
  if (game.clues.length === 0) {
    clueList.innerHTML = "<li class='empty-note'>Nothing yet. Look around!</li>";
  }
  for (var i = 0; i < game.clues.length; i++) {
    var clue = allClues[game.clues[i]];
    var li = document.createElement("li");
    li.innerHTML = "<strong>" + clue.title + ":</strong> " + clue.text;
    clueList.appendChild(li);
  }

  // list of items
  var itemList = document.getElementById("item-list");
  if (game.hasKey) {
    itemList.innerHTML = "<li>Small brass key</li>";
  } else {
    itemList.innerHTML = "<li class='empty-note'>Empty pockets.</li>";
  }

  // list of places visited
  var visitedList = document.getElementById("visited-list");
  visitedList.innerHTML = "";
  for (var j = 0; j < game.visited.length; j++) {
    var place = document.createElement("li");
    place.textContent = pageNames[game.visited[j]];
    visitedList.appendChild(place);
  }
}

function updateNav(page) {
  var current = document.getElementById("nav-" + page);
  if (current) {
    current.classList.add("current");
  }

  var atticLink = document.getElementById("nav-attic");
  if (atticLink && !game.hasKey) {
    atticLink.classList.add("locked");
    atticLink.textContent = "Attic (locked)";
  }

  // no name yet = you can't go into the house
  if (game.name === "") {
    var navLinks = document.querySelectorAll("nav a");
    for (var i = 0; i < navLinks.length; i++) {
      if (navLinks[i].id !== "nav-index") {
        navLinks[i].classList.add("locked");
        navLinks[i].title = "Sign your name first";
        navLinks[i].addEventListener("click", function (event) {
          event.preventDefault(); // stops the link from working
          var errorText = document.getElementById("name-error");
          if (errorText) {
            errorText.textContent = "Please sign your name before exploring the house.";
          }
        });
      }
    }
  }
}

// ---------- 4. Code that runs on every page ----------

var page = document.body.id;

// if someone types the address of a room without signing their name, send them back to the start
if (page !== "index" && game.name === "") {
  window.location.href = "index.html";
}

// remember that we visited this page
if (game.visited.indexOf(page) === -1 && (page === "index" || game.name !== "")) {
  game.visited.push(page);
  saveGame();
}

updateNav(page);
updateNotebook();

// pop-up close button (and clicking the dark background)
var popupBg = document.getElementById("popup");
if (popupBg) {
  document.getElementById("popup-close").addEventListener("click", closePopup);
  popupBg.addEventListener("click", function (event) {
    if (event.target === popupBg) {
      closePopup();
    }
  });
}

// show / hide notebook on small screens
var notebookToggle = document.getElementById("notebook-toggle");
if (notebookToggle) {
  notebookToggle.addEventListener("click", function () {
    document.getElementById("notebook").classList.toggle("open");
  });
}

// start over button
var resetButton = document.getElementById("reset-button");
if (resetButton) {
  resetButton.addEventListener("click", function () {
    var sure = confirm("Are you sure? All your clues will be lost.");
    if (sure) {
      localStorage.removeItem(SAVE_KEY);
      window.location.href = "index.html";
    }
  });
}

// ---------- 5. Code for each page ----------

if (page === "index") {
  setupStartPage();
} else if (page === "study") {
  setupStudy();
} else if (page === "workshop") {
  setupWorkshop();
} else if (page === "garden") {
  setupGarden();
} else if (page === "attic") {
  setupAttic();
} else if (page === "accuse") {
  setupAccuse();
}

/* ===== START PAGE ===== */
function setupStartPage() {
  var nameInput = document.getElementById("name-input");
  var startButton = document.getElementById("start-button");
  var errorText = document.getElementById("name-error");

  // if the player already started, welcome them back
  if (game.name !== "") {
    document.getElementById("new-player").classList.add("hidden");
    document.getElementById("returning-player").classList.remove("hidden");
    document.getElementById("returning-name").textContent = game.name;
    document.getElementById("returning-clues").textContent = game.clues.length;
  }

  startButton.addEventListener("click", function () {
    var name = nameInput.value.trim();
    if (name === "") {
      errorText.textContent = "Please sign your name before taking the case.";
      return;
    }
    game.name = name;
    saveGame();
    window.location.href = "study.html";
  });

  // pressing Enter in the box also works
  nameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      startButton.click();
    }
  });
}

/* ===== STUDY ===== */
function setupStudy() {
  var drawerTries = 0;
  var picture = document.getElementById("study-picture");

  // tick hotspots the player already looked at
  if (hasClue("diary")) markChecked("spot-drawer");
  if (hasClue("code")) markChecked("spot-painting");

  // Drawer: it is stuck, you have to keep trying
  document.getElementById("spot-drawer").addEventListener("click", function () {
    if (hasClue("diary")) {
      showPopup("The desk drawer", "The drawer is empty now. You already took the diary page.");
      return;
    }
    drawerTries++;
    if (drawerTries < 3) {
      showPopup("The desk drawer", "It's stuck! The wood has swollen. Maybe pull it again? (" + drawerTries + "/3)");
    } else {
      showPopup("The desk drawer", "With one last pull the drawer flies open. Inside is a torn page from Elias's diary:<br><br><em>" + allClues.diary.text + "</em>");
      addClue("diary");
      markChecked("spot-drawer");
    }
  });

  // Painting: swings open and shows numbers
  document.getElementById("spot-painting").addEventListener("click", function () {
    showPopup("The painting", "The painting above the fireplace is a little crooked. You lift the frame and it swings out like a door. Scratched into the wall behind it:<br><br><strong style='font-size:1.5rem'>4 - 1 - 7</strong>");
    addClue("code");
    markChecked("spot-painting");
  });

  // Bookshelf: text changes depending on what you found already
  document.getElementById("spot-bookshelf").addEventListener("click", function () {
    if (hasClue("letter")) {
      showPopup("Bookshelf", "Now you notice it: there's a gap on the shelf. A book called <em>Lighthouses of the North Coast</em> is missing. Elias must have taken it with him!");
    } else if (hasClue("diary")) {
      showPopup("Bookshelf", "You look for anything about time standing still... One book is called <em>Repairing Broken Clocks</em>. A stopped clock... maybe in the workshop?");
    } else {
      showPopup("Bookshelf", "Dusty books about gears, springs and pendulums. Elias really loved clocks. Nothing strange here... for now.");
    }
    markChecked("spot-bookshelf");
  });

  // Fireplace: putting out the fire makes the room dark and shows secret glowing writing
  document.getElementById("spot-fireplace").addEventListener("click", function () {
    picture.classList.toggle("dark");
    if (picture.classList.contains("dark")) {
      showToast("You put out the fire. In the dark, something glows on the wall...");
    } else {
      showToast("You light the fire again.");
    }
    markChecked("spot-fireplace");
  });
}

/* ===== WORKSHOP ===== */
function setupWorkshop() {
  var hour = 12;
  var hand = document.getElementById("hour-hand");
  var hourText = document.getElementById("hour-text");
  var clockMessage = document.getElementById("clock-message");

  function drawHand() {
    // each hour is 30 degrees (360 / 12)
    hand.style.transform = "rotate(" + (hour * 30) + "deg)";
    hourText.textContent = hour + " o'clock";
  }

  function compartmentIsOpen() {
    document.getElementById("clock-controls").classList.add("hidden");
    clockMessage.innerHTML = "The little compartment under the clock is open. You already took the <strong>brass key</strong>. It looks like it fits a door upstairs...";
    hour = 3;
    drawHand();
  }

  drawHand();
  if (game.hasKey) {
    compartmentIsOpen();
  }
  if (hasClue("gear")) markChecked("spot-gear");

  document.getElementById("hour-minus").addEventListener("click", function () {
    hour--;
    if (hour < 1) hour = 12;
    drawHand();
  });

  document.getElementById("hour-plus").addEventListener("click", function () {
    hour++;
    if (hour > 12) hour = 1;
    drawHand();
  });

  document.getElementById("hour-try").addEventListener("click", function () {
    if (hour === 3) {
      game.hasKey = true;
      saveGame();
      updateNotebook();
      // the attic link is not locked any more
      var atticLink = document.getElementById("nav-attic");
      atticLink.classList.remove("locked");
      atticLink.textContent = "Attic";
      showPopup("Click!", "The clock chimes three times and a tiny drawer slides out from underneath. Inside is a <strong>small brass key</strong> with a tag that says <em>\"Attic\"</em>.");
      compartmentIsOpen();
    } else {
      clockMessage.textContent = "Nothing happens at " + hour + " o'clock. The clock just ticks once and stops again.";
    }
  });

  // Hotspots
  document.getElementById("spot-gear").addEventListener("click", function () {
    showPopup("A small gear", "Among the clock parts on the bench is a little gear. Most of Elias's gears are perfect, but this one is rough, like a beginner made it. Stamped on the side are the letters <strong>V.C.</strong>");
    addClue("gear");
    markChecked("spot-gear");
  });

  document.getElementById("spot-clock").addEventListener("click", function () {
    if (game.hasKey) {
      showPopup("The big clock", "The secret drawer is open and empty. Time is standing still again.");
    } else {
      showPopup("The big clock", "This clock has stopped. Its hands are loose, like someone wanted them to be moved. You could try setting the time (see below).");
    }
    markChecked("spot-clock");
  });

  document.getElementById("spot-tools").addEventListener("click", function () {
    showPopup("Hooks and shelf", "Jars of oil, spare clock faces, tools hanging on hooks. One hook is empty and has a label: <em>\"V's lantern - DO NOT BORROW\"</em>.");
    markChecked("spot-tools");
  });
}

/* ===== GARDEN ===== */
function setupGarden() {
  var dialogue = document.getElementById("dialogue-text");
  var askVictor = document.getElementById("ask-victor");

  // the question about Victor only shows up if you found something about him
  if (hasClue("diary") || hasClue("gear")) {
    askVictor.classList.remove("hidden");
  }

  // Martha remembers if you talked before
  if (game.talkedToMartha) {
    dialogue.innerHTML = "<strong>Martha:</strong> Oh, you're back, " + game.name + ". Found anything yet?";
  }

  document.getElementById("ask-elias").addEventListener("click", function () {
    dialogue.innerHTML = "<strong>Martha:</strong> Mr. Thorne? Kind man, always busy. Yesterday Mayor Hale came shouting about buying the clock tower. Elias said no. Then this morning he was just... gone.";
    game.talkedToMartha = true;
    saveGame();
  });

  askVictor.addEventListener("click", function () {
    dialogue.innerHTML = "<strong>Martha:</strong> Victor, the apprentice? Hmm. Now that you ask... I couldn't sleep last night. Around midnight I saw him come out of my shed with a lantern. Very strange!";
    game.talkedToMartha = true;
    addClue("witness");
  });

  document.getElementById("ask-shed").addEventListener("click", function () {
    if (game.shedOpen) {
      dialogue.innerHTML = "<strong>Martha:</strong> You opened my shed? Those boots aren't mine, I promise!";
    } else {
      dialogue.innerHTML = "<strong>Martha:</strong> The shed? Elias changed the lock last week. Only he knew the numbers. He liked hiding things behind pictures, that man.";
    }
    game.talkedToMartha = true;
    saveGame();
  });

  // Combination lock
  if (game.shedOpen) {
    shedIsOpen();
  }

  document.getElementById("lock-try").addEventListener("click", function () {
    var a = document.getElementById("dial-1").value;
    var b = document.getElementById("dial-2").value;
    var c = document.getElementById("dial-3").value;
    var code = a + b + c;

    if (code === "417") {
      game.shedOpen = true;
      saveGame();
      showPopup("The shed opens!", "The lock clicks open. Behind some flower pots you find a pair of <strong>muddy boots</strong>. Written inside: <strong>V.C.</strong>");
      addClue("boots");
      shedIsOpen();
    } else {
      document.getElementById("lock-message").textContent = code + " is wrong. The lock doesn't move.";
    }
  });

  function shedIsOpen() {
    document.getElementById("lock-dials").classList.add("hidden");
    document.getElementById("lock-message").textContent = "The shed is open. You found the muddy boots.";
    markChecked("spot-shed");
  }

  // Hotspots
  document.getElementById("spot-martha").addEventListener("click", function () {
    showPopup("Martha the gardener", "Martha pops up from behind the bushes with a pair of shears and nods at you. Maybe ask her some questions (below the picture).");
    markChecked("spot-martha");
  });

  document.getElementById("spot-footprints").addEventListener("click", function () {
    if (hasClue("boots")) {
      showPopup("Footprints", "Big footprints, size 11. They are a perfect match for the muddy boots in the shed!");
    } else {
      showPopup("Footprints", "Big boot prints pressed into the gravel, leading from the house to the shed. Someone came this way recently.");
    }
    markChecked("spot-footprints");
  });

  document.getElementById("spot-shed").addEventListener("click", function () {
    if (game.shedOpen) {
      showPopup("The shed", "Flower pots, a watering can, and the spot where the boots were hidden.");
    } else {
      showPopup("The shed", "The green door is locked with a 3-number combination lock. You need the code.");
    }
  });
}

/* ===== ATTIC ===== */
function setupAttic() {
  // no key = you can't come in
  if (!game.hasKey) {
    document.getElementById("attic-locked").classList.remove("hidden");
    document.getElementById("attic-open").classList.add("hidden");
    return;
  }

  if (hasClue("letter")) markChecked("spot-desk");

  document.getElementById("spot-desk").addEventListener("click", function () {
    showPopup("The writing desk", "Under a pile of tools and papers on the desk is a sealed envelope with your name on it... no wait, it says <em>\"To whoever finds this\"</em>.<br><br><em>" + allClues.letter.text + "</em><br><br>- Elias Thorne");
    addClue("letter");
    markChecked("spot-desk");
  });

  document.getElementById("spot-window").addEventListener("click", function () {
    if (hasClue("letter")) {
      showPopup("The window", "Far away, the old lighthouse is blinking. On... off... on. Is it a signal? Elias must be there!");
    } else {
      showPopup("The window", "You can see the sea and an old lighthouse. It's supposed to be abandoned, but there's a light on.");
    }
    markChecked("spot-window");
  });

  document.getElementById("spot-chair").addEventListener("click", function () {
    showPopup("The chair", "There's a fur blanket on the chair, and it's still warm. Next to the chair is a teacup. The tea is still a little warm! Someone was here not long ago.");
    markChecked("spot-chair");
  });
}

/* ===== ACCUSATION ===== */
function setupAccuse() {
  var buttons = document.querySelectorAll(".accuse-button");
  var warning = document.getElementById("accuse-warning");

  // you need at least 3 clues to accuse someone
  if (game.clues.length < 3) {
    warning.textContent = "You only have " + game.clues.length + " clue(s). The police won't listen until you have at least 3. Keep exploring!";
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  } else {
    warning.textContent = "You have " + game.clues.length + " clues. Choose carefully...";
  }

  // remember the last choice
  if (game.lastAccused !== "") {
    document.getElementById("last-choice").textContent = "Last time you accused " + game.lastAccused + ".";
  }

  for (var j = 0; j < buttons.length; j++) {
    buttons[j].addEventListener("click", function () {
      var suspect = this.getAttribute("data-suspect");
      game.lastAccused = suspect;
      saveGame();
      showEnding(suspect);
    });
  }

  function showEnding(suspect) {
    // hide all endings first
    var endings = document.querySelectorAll(".ending");
    for (var k = 0; k < endings.length; k++) {
      endings[k].style.display = "none";
    }

    var endingId;
    if (suspect === "Victor Crane") {
      if (hasClue("letter") && game.clues.length >= 5) {
        endingId = "ending-best";
      } else {
        endingId = "ending-half";
      }
    } else {
      endingId = "ending-wrong";
      document.getElementById("wrong-name").textContent = suspect;
    }

    var names = document.querySelectorAll(".player-name");
    for (var n = 0; n < names.length; n++) {
      names[n].textContent = game.name || "Detective";
    }

    var ending = document.getElementById(endingId);
    ending.style.display = "block";
    ending.scrollIntoView({ behavior: "smooth" });
  }
}
