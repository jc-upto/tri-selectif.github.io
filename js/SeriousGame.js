/**
 * Handle the serious game.
 */
class SeriousGame
{
    /**
     * Construct the game and all recycles.
     */
    constructor() {
        this.data = null;
        this.gamePoints = 0;
        this.attempts = 0;
        this.gameScoreUpdatedEvent = new CustomEvent("onGameScoreUpdated");
        this.gameEndedEvent = new CustomEvent("onGameEnded");
        this.currentRecyclesElements = null;
        this.blueRecycle = new Recycle("blue");
        this.yellowRecycle = new Recycle("yellow");
        this.brownRecycle = new Recycle("brown");
        this.greenRecycle = new Recycle("green");
        this._getData();
        document.body.addEventListener("onDropReceived", function(event) {
            this.computeResult(event);
        }.bind(this));
    }


    computeResult(resultData){
        this.attempts++;
        if(this.attempts < 10) {
            if (resultData.message) {
                this.gamePoints++;
                resultData.element.style.display = "none";
                this.gameScoreUpdatedEvent.response = " Correct !"
            } else {
                this.gameScoreUpdatedEvent.response = " Bad answer, this item is attached to the " + this.getRecycle(resultData.name) + " recycle";
            }

            this.gameScoreUpdatedEvent.message = this.gamePoints;
            document.body.dispatchEvent(this.gameScoreUpdatedEvent);
        }
        if(this.attempts === 9) {
            this.gameEndedEvent.message = "Game is over !"
            document.body.dispatchEvent(this.gameEndedEvent);
        }
    }


    /**
     * Bind all HTML recycles parent elements.
     */
    bindElements(yellowRecycle, greenRecycle, blueRecycle, brownRecycle){
        this.yellowRecycle.setHtmlElement(yellowRecycle);
        this.greenRecycle.setHtmlElement(greenRecycle);
        this.blueRecycle.setHtmlElement(blueRecycle);
        this.brownRecycle.setHtmlElement(brownRecycle);
    }


    /**
     * Create random images from all Recycle elements.
     * @param containerElement The container that will get all image elements.
     */
    getImages(containerElement) {
        let recyclesItems = [
            ...this.blueRecycle.getItemsNames(), ...this.yellowRecycle.getItemsNames(),
            ...this.brownRecycle.getItemsNames(), ...this.greenRecycle.getItemsNames()
        ];

        // 10 random elements about 36 available.
        this.currentRecyclesElements = [];
        for(let i = 0; i < 10; i++) {
            let recycleElement;
            do{
               recycleElement = recyclesItems[Math.floor(Math.random() * recyclesItems.length)];
            }
            while(this.currentRecyclesElements.includes(recycleElement));

            this.currentRecyclesElements.push(recycleElement);
            // Creating image.
            let recycleImage = document.createElement("img");
            recycleImage.setAttribute("id", recycleElement);
            recycleImage.setAttribute("src", this._getPath(recycleElement));
            recycleImage.setAttribute("draggable", "true");
            recycleImage.style.width  = "20%";
            recycleImage.style.height = "20%";
            recycleImage.style.marginRight = "20px";
            // Adding D&D event.
            recycleImage.addEventListener("dragstart", function(event) {
                event.dataTransfer.setData("element", this.id);
            });
            containerElement.appendChild(recycleImage);
        }
    }


    /**
     * Synchronously get the JSON file.
     * @private
     */
    _getData() {
        let jsonRequest = new XMLHttpRequest();
        jsonRequest.open('GET', "http://localhost/items.json", false);
        jsonRequest.send(null);

        if (jsonRequest.status === 200) {
            this.data = JSON.parse(jsonRequest.response);
            this.blueRecycle.setData(this.data.blue);
            this.yellowRecycle.setData(this.data.yellow);
            this.brownRecycle.setData(this.data.brown);
            this.greenRecycle.setData(this.data.green);
        }

    }


    /**
     * Return the element path regardless witch recycle owns the element.
     * @param element
     * @private
     */
    _getPath(element) {
        if(this.blueRecycle.inRecycle(element)) {
            return this.blueRecycle.getItemPath(element);
        }
        else if(this.greenRecycle.inRecycle(element)) {
            return this.greenRecycle.getItemPath(element);
        }
        else if(this.brownRecycle.inRecycle(element)) {
            return this.brownRecycle.getItemPath(element);
        }
        else if(this.yellowRecycle.inRecycle(element)) {
            return this.yellowRecycle.getItemPath(element);
        }
        return "assets/poub-template-closed.png";
    }


    /**
     * Return the recycle color of the given element.
     * @param element
     * @returns {string}
     */
    getRecycle(element) {
        if(this.blueRecycle.inRecycle(element)) {
            return this.blueRecycle.getColour();
        }
        else if(this.greenRecycle.inRecycle(element)) {
            return this.greenRecycle.getColour();
        }
        else if(this.brownRecycle.inRecycle(element)) {
            return this.brownRecycle.getColour();
        }
        else {
            return this.yellowRecycle.getColour();
        }
    }

}


class Recycle
{

    /**
     * Construct a Recycle object.
     * @param recycleType
     */
    constructor(recycleType) {
        this.type = recycleType;
        this.availableElements = [];
        this.HtmlElement = null;
        this.dropEvent = new CustomEvent("onDropReceived");

    }


    /**
     * Set available items.
     * @param data
     */
    setData(data) {
        this.availableElements = data;
    }


    /**
     * Retour the recycle colour.
     * @returns {*}
     */
    getColour() {
        return this.type;
    }


    /**
     * Set the HTML parent element of this recycle.
     * @param element
     */
    setHtmlElement(element) {
        this.HtmlElement = element;

        // Allowing drag and drop.
        element.addEventListener("dragover", function(event) {
            event.preventDefault();
        });

        // Changing image src on dragenter.
        element.addEventListener("dragenter", function(event) {
            event.target.setAttribute("src", "assets/poub-" + this.type + "-opened.png");
        }.bind(this));

        // The same closing the drop event.
        element.addEventListener("dragleave", function(event) {
            event.target.setAttribute("src", "assets/poub-" + this.type + "-closed.png");
        }.bind(this));

        // The same closing the drop event.
        element.addEventListener("drop", function(event) {
            event.preventDefault();
            event.target.setAttribute("src", "assets/poub-" + this.type + "-closed.png");
            if(this.inRecycle(event.dataTransfer.getData("element"))) {
                this.dropEvent.message = true;
                this.dropEvent.element = document.getElementById(event.dataTransfer.getData("element"));
            }
            else {
                this.dropEvent.message = false;
            }
            this.dropEvent.name = event.dataTransfer.getData("element");
            document.body.dispatchEvent(this.dropEvent);
        }.bind(this));

    }


    /**
     * Return the HTML parent element of this recycle.
     * @returns {*}
     */
    getHtmlElement() {
        return this.HtmlElement;
    }


    /**
     * Return true if the given element is owned by this Recycle.
     * @param element
     * @returns {boolean}
     */
    inRecycle(element) {
        return this._getIndex(element) || false;
    }


    /**
     * Return the given element image path.
     * @param itemName
     * @returns {string|*}
     */
    getItemPath(itemName) {
        let index = this._getIndex(itemName);
        return (index !== false) ? this.availableElements[index]["path"] : "";
    }


    /**
     * Return all available items names.
     * @returns {[]}
     */
    getItemsNames() {
        let items = [];

        for(let index in Object.keys(this.availableElements)) {
            items.push(this.availableElements[index]["item"]);
        }

        return items;
    }


    /**
     * Return the index of provided element.
     * @param element
     * @returns {string|boolean}
     * @private
     */
    _getIndex(element) {
        for(let index in Object.keys(this.availableElements)) {
            if(this.availableElements[index]["item"].toLowerCase() === element.toLowerCase()) {
                return index;
            }
        }
        return false;
    }
}