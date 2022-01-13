const webcamElement = document.getElementById('webcam'); // declare video container, which display the stream
const canvasElement = document.getElementById('canvas-none'); // declare image container, which display tacked photo
const webcam = new Webcam(webcamElement, 'environment', canvasElement); // declare the Webcam instance

let game = new Game();

/**
 * This function started the streaming
 * */
function startVideo() {
    webcam.start().then(result => {
        console.log("webcam started");
    }).catch(err => {
        console.log(err);
    });
}
window.onload = function () {
    startVideo();
}

/**
 * This function take a photo and send it to backend. Add a new user message on the chat.
 * */
const takePhoto = () => {
    let picture = webcam.snap();
    sendPhoto(picture);

    let message = new Message(picture)
    message.isFromChatBot = false;
    message.addMessage()
}

/**
 * This function send a POST request to the backend with the picture, index of guessed item, and number of attempts.
 * Then convert the response to message
 * */
const sendPhoto = (picture) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", '/detect/image', true);
    let formData = new FormData()
    formData.append("theFile", picture)
    formData.append("indexGuessedItem", game.indexGuessedItem)
    formData.append("numTry", game.numTry)
    xhr.send(formData);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const res = JSON.parse(this.responseText)
            game.manageResult(res);
        }
    };
}

/**
 * This function send a POST request to the backend with the url of picture, index of guessed item, and number of attempts.
 * Add the picture and the url as user message on the chat.
 * Then convert the response to message
 * */
const sendPhotoFromUrl = () => {
    let url;
    $(document).ready(function () {
        const input = $("#url-input")
        url = input.val()

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/detect/url', true);
        let formData = new FormData()
        formData.append("theFile", url)
        formData.append("indexGuessedItem", game.indexGuessedItem)
        formData.append("numTry", game.numTry)

        if (url){
         xhr.send(formData);
        }

        if (isURL(url)) {
            let message = new Message(url)
            message.isFromChatBot = false;
            message.isWithUrl = true;
            message.addMessage()
        }

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const res = JSON.parse(this.responseText)
                game.manageResult(res);
            }
        };

        input.val("")
    });
}

/**
 * check if the string match the url pattern
 * */
function isURL(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}