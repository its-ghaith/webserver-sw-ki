# webserver-sw-ki  
This repository is for an artificial intelligence project. The web server should think of a Sightseeing and the user should guess it.

## Training Process
[The documentation of training process is in:](./training_prozess/Dokumentation_Training_Val_Prozess.docx)

## Frontend
The front end is purely JavaScript, without frameworks. However, Bootstrap was used for styling in order to be able to implement the best possible mobile-friendly implementation. CSS was only used in certain cases.

###  Department of HTML
The design is divided into three parts:
 1. **Stream placeholder:** showing the output of the phone or computer camera. With this part the user can see what he wants to photograph and send to server.
 2. **Chat:** The task of this part is to list all messages from user and chat bot. The user's messages are displayed on the right, and on the left are messages from the chatbot
 3. **Kontrollpanel:** The user can write a message in the input field. The message should not be empty or no URL.
Next to it are the buttons for sending the message or photo to the server.

**The HTML file is under this path: `./templates/index.html`**
**The page look so:** 
![Design the web site 1](/img/1.png)
![Design the web site 2](/img/2.png)

###  JavaScript
consists of three files:
1. **`./static/js/Game.js`** This class Control everything about the game

| Name | Function | Paramertes |
|--|--|--|
| constructor | declare index of guessed item, The number represents any tourist attraction chosen by the computer. The names of the attractions are not written here to hide any information from the user. choose one of the items of list. init the attempts number  | none |
| manageResult | declare index of guessed item, The number represents any tourist attraction chosen by the computer. The names of the attractions are not written here to hide any information from the user. choose one of the items of list. init the attempts number  | res: {object} should have result, message, isError, hint |
| userWinInSW | This method reset the numTry and add the user win message  | res: {object} should have result, message, isError, hint |
| userLossOneAttempt | This method increase the numTry and add the user loss message in one try | res: {object} should have result, message, isError, hint |
| userLossInSw| This method increase the numTry and add the user loss message in one try | none |
| chooseAttractions | This mehtod choose one of index list and delete it from the list and check if all item is deleted, if yes check if the user want to play again | none |
2. **`./static/js/Message.js`**: This class represent the message on the 

| Name | Function |
|--|--|
| constructor| has one string paramerter, which repersent the message |
| addMessage | This method add a new message on the chat, and check if the message from chat bot or from user |
| addServerErrorMessage| This method add error message on the chat with red "Fehler" word on the header|
| chatBotMessage| This method convert the chat bot message as li html tag and add it on the chat|
| userMessage| This method convert the user message as li html tag and add it on the chat|
3. **`./static/js/index.js`** 

| Name | Function |
|--|--|
| startVideo | This function started the streaming  |
| takePhoto | This function take a photo and send it to backend. Add a new user message on the chat. |
| sendPhoto| This function send a POST request to the backend with the picture, index of guessed item, and number of attempts, then convert the response to message|
| sendPhotoFromUrl | This function send a POST request to the backend with the url of picture, index of guessed item, and number of attempts. Add the picture and the url as user message on the chat, then convert the response to message |
| isURL| check if the string match the url pattern|

## Backend
The application is a web app that thinks of one of the Dictionary SW_list items.  
The client sends either a photo or a link of a SW to guess the imaginary SW.  
  
The web server is implemented by Flask. The library to recognize images is YOLOv5.
list of all attractions is in the dictionray `SW_list` with the hints.
The model path is: `./yolov5/weights/best.pt` in the path program it is save in the variable `model_path` 

### Functions:
| Name | params | Funktion | return |
|--|--|--|--|
| detect_image |  request body: <br> **indexGuessedItem** (int): Index of guessed Item <br> **numTry** (int): number of try. from 1-4 <br> **theFile** (base64 image): image with the binary-to-text encoding | Route with the URL: `/dectect/image` | - If client expected the item  {"result": True, "message": client victory message , "hint": name of item } <br> -If client not expected the item  {"result": True, "message": client defeat message , "hint": the new hint } <br> - If the number of Attempts more that 4 {"result": False, "message": False} |
| detect_from_url| request body: <br> **indexGuessedItem** (int): Index of guessed Item <br> **numTry** (int): number of try. from 1-4 <br> **theFile** (string): Image URL | POST Route with the URL:`/dectect/url` | like detect_image  |
| index | none | The home page as html file with the URL:`/` | html page |
| detect | image_url: the image file path. In this case one path of image, which saved in temp folder, or url | This function get the image url and give it to the AI Model to detect all class in the image| name of detected classes in the image |
| _check_guess | index_guessed_item: index the item, which object has guesses <br> list_detected_class: all detected classes in the image <br> num_try: number of Attempts  | This function check if the guessed item in the classes the detected image| a dictionary with result, message, some time hint |
| _save_b64_in_file | image_b64: image as base64  | This function save the image as base64 coding | the path of saved image in the temp folder |
| _request_2_variables | request_form: request form should has in the case indexGuessedItem, numTry,  and theFile. theFile can be base64 image or URL of image | This function convert the request form to useful variables | the variables |
| _is_url_image | rimage_url: URL of image | Check if the image exist in the internet -> and the url is valid | True if image exist, false if not or when happened an error. The error happened when the URL is invalid |