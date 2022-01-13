/**
 * This class represent the message on the chat.
 * */
class Message {
    /**
     * @param messageString {string}
     * */
    constructor(messageString) {
        this._messageString = messageString;
        this._isFromChatBot = true;
        this._isHint = false;
        this._isError = false;
        this._isWithUrl = false;
        this._hint = "";
    }

    /**
     * This method add a new message on the chat, and check if the message from chat bot or from user
     * */
    addMessage = () => {
        let li = document.createElement("li");

        if (this.isFromChatBot)
            li.innerHTML = this.chatBotMessage();
        else
            li.innerHTML = this.userMessage();

        $(document).ready(function () {
            $(".message-list").append(li);
            window.scrollTo(0, document.body.scrollHeight);
        });
    }

    /**
     * This method add error message on the chat with red "Fehler" word on the header
     * */
    addServerErrorMessage = () => {
        this.isError = true
        this.addMessage()
    }

    /**
     * This method convert the chat bot message as li html tag and add it on the chat
     * */
    chatBotMessage = () => {
        let row = '<div class="chatbot-message-el">\n' +
            '                                    <div class="chatbot-message">\n' +
            '                                        <div class="chatbot-tailwrapper">\n' +
            '                                            <svg class="chatbot-tail" viewBox="0 0 8 13" width="8" height="13">\n' +
            '                                                <path fill="currentColor"\n' +
            '                                                      d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z">\n' +
            '                                                </path>\n' +
            '                                            </svg>\n' +
            '                                        </div>\n' +
            '                                        <div class="chatbot-message-content">\n' +
            '                                            <div class="hint [1]">\n' +
            '                                                <span>\n' +
            '                                                    [3]\n' +
            '                                                </span>\n' +
            '                                            </div>\n' +
            '                                                    <span>\n' +
            '                                                       [2]' +
            '                                                    </span>\n' +
            '                                        </div>\n' +
            '                                    </div>\n' +
            '                                </div>'

        if (this.isHint) {
            row = row.replace('[1]', "text-warning");
            row = row.replace('[3]', "Hinweis");
        } else if (this.isError) {
            row = row.replace('[1]', "text-danger");
            row = row.replace('[3]', "Fehler");
        } else {
            row = row.replace('[1]', "text-info");
            row = row.replace('[3]', "Info");
        }
        row = row.replace('[2]', this.messageString);
        return row
    }

    /**
     * This method convert the user message as li html tag and add it on the chat
     * */
    userMessage = () => {
        let row = '<li>\n' +
            '                                    <div class="row justify-content-end user-message-el">\n' +
            '                                        <div class="user-message">\n' +
            '                                            <div class="row user-message-content">\n' +
            '                                                <a class="[2] mb-2" style="word-break: break-all" src="[1]" alt="">[1]</a>' +
            '                                                <img src="[1]" alt="">' +
            '                                            </div>\n' +
            '                                            <div class="user-tailwrapper">\n' +
            '                                                <svg class="user-tail" viewBox="0 0 8 13" width="8" height="13">\n' +
            '                                                    <path fill="currentColor"\n' +
            '                                                          d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z">\n' +
            '                                                    </path>\n' +
            '                                                </svg>\n' +
            '                                            </div>\n' +
            '                                        </div>\n' +
            '                                    </div>\n' +
            '                                </li>'

        row = row.replaceAll("[1]", this.messageString)
        if (!this.isWithUrl)
            row = row.replaceAll("[2]", "d-none")
        return row;
    }

    get messageString() {
        return this._messageString;
    }

    set messageString(value) {
        this._messageString = value;
    }

    get isFromChatBot() {
        return this._isFromChatBot;
    }

    set isFromChatBot(value) {
        this._isFromChatBot = value;
    }

    get isHint() {
        return this._isHint;
    }

    set isHint(value) {
        this._isHint = value;
    }

    get isError() {
        return this._isError;
    }

    set isError(value) {
        this._isError = value;
    }

    get isWithUrl() {
        return this._isWithUrl;
    }

    set isWithUrl(value) {
        this._isWithUrl = value;
    }


    get hint() {
        return this._hint;
    }

    /**
     * @param value {string}
     * */
    set hint(value) {
        this._hint = value;
        let message = new Message(this._hint)
        message.isHint = true
        message.addMessage()
    }
}