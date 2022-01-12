const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas-none');
const webcam = new Webcam(webcamElement, 'environment', canvasElement);

let list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let indexGuessedItem = chooseAttractions()
let numTry = 0

function startVideo() {
    webcam.start().then(result => {
        console.log("webcam started");
    }).catch(err => {
        console.log(err);
    });
}

function chooseAttractions() {
    if (list.length === 0)
        if (confirm("Du hast alle Sehenwürdigkeiten. Willst du das Spiel nochmal spielen")) {
            list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }

    // get random index value
    const randomIndex = Math.floor(Math.random() * list.length);

    // get random item
    const choose = list[randomIndex];

    list = list.filter(item => item !== choose)
    return choose;
}

const takePhoto = () => {
    let picture = webcam.snap();
    sendPhoto(picture);

    addMessage({
        message: picture,
        isFromChatBot: false,
    })
}


// {"result": False, "message": "Invalid URL", "isError": True}

const result2Message = (res) => {
    if (!res.message) {
        numTry = 0
        addMessage({
            message: "Du hast diese Sehenwürdigkeit nicht erraten gekonnt. Das ist natürlich mein Vergnügen.",
        })

        addMessage({
            message: "🦾 🤖",
        })

        addMessage({
            message: "Aber ich werde Mitleid mit dir haben und die Sehenwürdigkeit für dich ändern, und ich werde dir drei Versuche geben.",
        })
        indexGuessedItem = chooseAttractions()

    } else if (res.isError) {
        addMessage({message: res.message, isError: true})
    } else if (!res.result) {
        if (numTry <= 2) {
            numTry += 1
            addMessage({message: res.message})
            addMessage({message: res.hint, isHint: true})
            addMessage({message: "Du hast noch " + (4 - numTry) + " Versuche."})
        }
    } else {
        addMessage({message: res.message})
        addMessage({message: res.hint, isHint: true})
        numTry = 0
    }
}

const sendPhoto = (picture) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", '/detect/image', true);
    let formData = new FormData()
    formData.append("theFile", picture)
    formData.append("indexGuessedItem", indexGuessedItem)
    formData.append("numTry", numTry)
    xhr.send(formData);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const res = JSON.parse(this.responseText)
            result2Message(res);
        }
    };
}

const sendPhotoFromUrl = () => {
    let url;
    $(document).ready(function () {
        const input = $("#url-input")
        url = input.val()

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/detect/url', true);
        let formData = new FormData()
        formData.append("imageUrl", url)
        formData.append("indexGuessedItem", indexGuessedItem)
        formData.append("numTry", numTry)
        xhr.send(formData);
        addMessage({message: url, isFromChatBot: false, withUrl: true})

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const res = JSON.parse(this.responseText)
                result2Message(res);
            }
        };

        input.val("")

    });
}

const addMessage = (message) => {

    message = {
        message: message.message,
        isFromChatBot: message.isFromChatBot === undefined ? true : message.isFromChatBot,
        isHint: message.isHint === undefined ? false : message.isHint,
        isError: message.isError === undefined ? false : message.isError,
        withUrl: message.withUrl === undefined ? false : message.withUrl,
    }

    let li = document.createElement("li");

    if (message.isFromChatBot)
        li.innerHTML = chatBotMessage(message);
    else
        li.innerHTML = userMessage(message);

    $(document).ready(function () {
        $(".message-list").append(li);
        window.scrollTo(0, document.body.scrollHeight);
    });
}

const chatBotMessage = (message) => {
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

    if (message.isHint) {
        row = row.replace('[1]', "text-warning");
        row = row.replace('[3]', "Hinweis");
    } else if (message.isError) {
        row = row.replace('[1]', "text-danger");
        row = row.replace('[3]', "Fehler");
    } else {
        row = row.replace('[1]', "text-info");
        row = row.replace('[3]', "Info");
    }
    row = row.replace('[2]', message.message);
    return row
}

const userMessage = (message) => {
    let row = '<li>\n' +
        '                                    <div class="row justify-content-end user-message-el">\n' +
        '                                        <div class="user-message">\n' +
        '                                            <div class="row user-message-content">\n' +
        '                                                <a class="mb-2 [2]" href="[1]">[1]</a>' +
        '                                                <img src="[1]">' +
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

    row = row.replaceAll("[1]", message.message)
    if (!message.withUrl)
        row = row.replaceAll("[2]", "d-none")

    return row;
}

window.onload = function () {
    startVideo();
}