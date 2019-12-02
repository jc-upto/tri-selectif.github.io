let yellowRecycle = document.getElementById("yellow-recycle");
let greenRecycle   = document.getElementById("green-recycle");
let blueRecycle   = document.getElementById("blue-recycle");
let brownRecycle   = document.getElementById("brown-recycle");

document.body.addEventListener("onGameScoreUpdated", function(event) {
    let resultArea = document.getElementById("total-points");
    let response = document.getElementById("response");
    resultArea.innerHTML = "Your current score is: " + event.message + "/10. ";
    response.innerHTML = event.response;
});

document.body.addEventListener("onGameEnded", function(event) {
   let gameArea = document.getElementById("images-container");
   gameArea.style.color = "green";
   gameArea.style.fontWeight = "bold";
   gameArea.style.fontSize = "44px";
   gameArea.style.display = "flex";
   gameArea.style.flexDirection = "column";
   gameArea.style.alignItems = "center";
   gameArea.style.justifyContent = "center";
   gameArea.innerHTML = event.message;
});

game = new SeriousGame();
game.bindElements(yellowRecycle, greenRecycle, blueRecycle, brownRecycle);
game.getImages(document.getElementById("images-container"));