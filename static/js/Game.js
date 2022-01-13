class Game {

    constructor() {
        // declare index of guessed item, The number represents any tourist attraction chosen by the computer.
        // The names of the attractions are not written here to hide any information from the user
        this._list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

        // choose one of the items of list
        this._indexGuessedItem = this.chooseAttractions()

        this._numTry = 0 // init the attempts number
    }

    manageResult = (res) => {
    if (res.isError) {
        let message = new Message(res.message)
        message.addServerErrorMessage()
        return;
    }

    if (!res.message) {
        this.userLossInSw();
    } else if (!res.result) {
        if (this.numTry <= 2) {
            this.userLossOneAttempt(res);
        }
    } else {
        this.userWinInSW(res);
    }
}

    userLossInSw() {
        this.numTry = 0

        let message = new Message("Du konntest  diese Sehenswürdigkeit nicht erraten gekonnt. Das ist natürlich mein Vergnügen.")
        message.addMessage()

        message = new Message("🦾 🤖")
        message.addMessage()

        message = new Message("Aber ich werde Mitleid mit dir haben und die Sehenswürdigkeit für dich ändern, und ich werde dir drei Versuche geben.")
        message.addMessage()

        this.indexGuessedItem = this.chooseAttractions()
    }

    userWinInSW(res) {
        this.numTry = 0
        let message = new Message(res.message)
        message.addMessage()
        message.hint = res.hint
    }

    userLossOneAttempt(res) {
        this.numTry += 1

        let message = new Message(res.message)
        message.addMessage()
        message.hint = res.hint

        message = new Message("Du hast noch " + (4 - this.numTry) + " Versuche.")
        message.addMessage()
    }

    /**
     * This function choose one of index list and delete it from the list
     * check if all item is deleted, if yes check if the user want to play again
     * */
    chooseAttractions() {
        if (this.list.length === 0)
            if (confirm("Du hast alle Sehenswürdigkeiten. Willst du das Spiel nochmal spielen")) {
                this.list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            }

        // get random index value
        const randomIndex = Math.floor(Math.random() * this.list.length);

        // get random item
        const choose = this.list[randomIndex];

        this.list = this.list.filter(item => item !== choose)
        return choose;
    }


    get list() {
        return this._list;
    }

    set list(value) {
        this._list = value;
    }

    get indexGuessedItem() {
        return this._indexGuessedItem;
    }

    set indexGuessedItem(value) {
        this._indexGuessedItem = value;
    }

    get numTry() {
        return this._numTry;
    }

    set numTry(value) {
        this._numTry = value;
    }
}