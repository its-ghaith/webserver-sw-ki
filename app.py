# coding=utf-8

"""
The application is a web app that thinks of one of the Dictionary SW_list items.
The client sends either a photo or a link of a SW to guess the imaginary SW.

The web server is implemented by Flask. The library to recognize images is YOLOv5.
"""

import requests
from yolov5 import YOLOv5
import base64
from flask import Flask, request, render_template
import tempfile
from mimetypes import guess_extension, guess_type

# declare the Flask app
app = Flask(__name__)

# set model params
model_path = "yolov5/weights/best.pt"  # Path to the weights of the AI model
device = "cpu"  # or "cpu"

# init yolov5 model
yolov5 = YOLOv5(model_path, device)

# Prepare the list of all SW. Convert the dictionary to a list
SW_list = {
    "BrandenburgerTor": {
        "name": "BrandenburgerTor",
        "displayName": "Brandenburger Tor",
        "index": 1,
        "hints": [
            "Sie ist eindeutsches Nationalsymbol",
            "Sie gehört zu den wichtigsten Wahrzeichen ihrer Stadt",
            "Sie ist im Grunde ein Triumphtor"
        ]
    },

    "Reichstag": {
        "name": "Reichstag",
        "displayName": "Reichstag",
        "index": 2,
        "hints": [
            "Es liegt in der Hauptstadt",
            "Das Gebäude hat 4 Türme und eine Kuppel",
            "Das ist das Zentrum des politischen Systems Deutschlands"
        ]
    },

    "Fernseherturm": {
        "name": "Fernseherturm",
        "displayName": "Fernseherturm",
        "index": 3,
        "hints": [
            "Es liegt in der Hauptstadt",
            "Es ist 368 Meter hoch",
            "Es liegt am Alexanderplatz"
        ]
    },

    "Rheinau-Hafen": {
        "name": "Rheinau-Hafen",
        "displayName": "Rheinauhafen",
        "index": 4,
        "hints": [
            "Sie liegt in einer Nordwestlichen Landeshauptstadt ",
            "Sie hat 3 identische Kranhäuser",
            "Sie ist am Rhein",
        ]
    },

    "Alpspitze": {
        "name": "Alpspitze",
        "displayName": "Alpspitze",
        "index": 5,
        "hints": [
            "Sie liegt in den bayerischen Alpen",
            "Sie ist in der Nähe von der Zugspitze",
            "Sie ist ein Berg, der aus Wettersteinkalk besteht",
        ]
    },

    "KölnerDom": {
        "name": "KölnerDom",
        "displayName": "Kölner Dom",
        "index": 6,
        "hints": [
            "Sie liegt im Bundesstaat, das an die Niederlände grenzt",
            "Sie gehört zu der größten Sehenswürdigkeiten im gotischen Baustil",
            "Sie ähnelt dem Mailänder Dom",
        ]
    },

    "Volkerschlachtdenkmal": {
        "name": "Volkerschlachtdenkmal",
        "displayName": "Volkerschlachtdenkmal",
        "index": 7,
        "hints": [
            "Sie liegt im Bundesstaat, das von Sachsen-Anhalt, Thüringen und Brandenburg gegrenzt ist",
            "Sie ist ein Denkmal einer Schlacht zwischen Napleon gegen Russland und Preußen",
            "Mit 91 Metern Höhe zählt sie zu den größten Denkmälern Europas",
        ]
    },

    "Frauenkirche": {
        "name": "Frauenkirche",
        "displayName": "Frauenkirche",
        "index": 8,
        "hints": [
            "Sie liegt in einer südlichen Landeshauptstadt ",
            "Sie hat zwei auffälligetürme",
            "Da kann man beten oder die spätgotische Backsteinbau bewundern",
        ]
    },

    "Kreidefelsen": {
        "name": "Kreidefelsen",
        "displayName": "Kreidefelsen",
        "index": 9,
        "hints": [
            "Es ist eine Küstenlandschaft",
            "Das „Tor“ dazu ist Stralsund",
            "Sie liegt an der Küste des Ostsees",
        ]
    },

    "SchlossNeuschwanstein": {
        "name": "SchlossNeuschwanstein",
        "displayName": "Schloss Neuschwanstein",
        "index": 10,
        "hints": [
            "Die liegt im Bundesstaat, das an Österreich grenzt",
            "Die hat Walt Disney für sein Logo inspiriert",
            "Sobald du sie siehst, fallen dir Märchen ein",
        ]
    },
}  # List all sights with the notices
values = SW_list.values()
values_list = list(values)


@app.route("/detect/image", methods=['POST'])
def detect_image():
    """
    POST Route with the URL: "/dectect/image"

    :param: request body:
                indexGuessedItem (int): Index of guessed Item
                numTry (int): number of try. from 1-4
                theFile (base64 image): image with the binary-to-text encoding

    :return:
        If client expected the item
            {"result": True, "message": client victory message , "hint": name of item }

        If client not expected the item
            {"result": True, "message": client defeat message , "hint": the new hint }

        If the number of Attempts more that 4
            {"result": False, "message": False}
    """

    # Accept just POST request
    if not request.method == 'POST':
        return

    image, index_guessed_item, num_try = _request_2_variables(request.form)

    image_path = _save_b64_in_file(image)  # convert the base64 to file and get the path of this file
    list_detected_class = detect(image_path)  # get all classes in the image
    result = _check_guess(index_guessed_item, list_detected_class,
                          num_try)  # check if the image has the same class of guessed item

    return result, 200


@app.route("/detect/url", methods=['POST'])
def detect_from_url():
    """
        POST Route with the URL: "/dectect/url"

        :param: request body:
                    indexGuessedItem (int): Index of guessed Item
                    numTry (int): number of try. from 1-4
                    theFile (base64 image): Image URL

        :return:
            If client expected the item
                {"result": True, "message": client victory message , "hint": name of item }

            If client not expected the item
                {"result": True, "message": client defeat message , "hint": the new hint }

            If the number of Attempts more that 4
                {"result": False, "message": False}
    """

    if not request.method == 'POST':
        return

    image_url, index_guessed_item, num_try = _request_2_variables(request.form)

    if not _is_url_image(image_url):
        return {"result": False, "message": "Ungültige URL", "isError": True}, 200

    list_detected_class = detect(image_url)
    result = _check_guess(index_guessed_item, list_detected_class, num_try)

    return result, 200


@app.route("/")
def index():
    """
    :return: The home page as html file
    """
    return render_template('index.html')


def detect(image_url):
    """
    This function get the image url and give it to the AI Model to detect all class in the image
    :param image_url: the image file path. In this case one path of image, which saved in temp folder, or url
    :return: name of detected classes in the image
    """
    # perform inference
    results = yolov5.predict(image_url)

    # parse results
    predictions = results.pred[0]
    categories = predictions[:, 5]
    list_names = []
    for cat in categories:
        list_names.append(results.names[int(cat)])

    return list_names


def _check_guess(index_guessed_item: int, list_detected_class: list, num_try: int):
    """
    This function check if the guessed item in the classes the detected image
    :param index_guessed_item: index the item, which object has guesses
    :param list_detected_class: all detected classes in the image
    :param num_try: number of Attempts
    :return: a dictionary with result, message, some time hint
    """
    guessed_item = values_list[index_guessed_item - 1]

    if list_detected_class.__contains__(guessed_item["name"]):
        return {"result": True, "message": "Du hast dies Mal mich geschlagen. <br/>😬😡",
                "hint": "Richtig, die Sehenswürdigkeit heißt " + guessed_item["displayName"]}

    elif num_try >= 3:
        return {"result": False, "message": False}

    return {"result": False, "message": "Ich gratuliere mir selbst 😁😁😁, ich habe dich geschlagen. <br/>🥳🥳🥳",
            "hint": guessed_item['hints'][num_try]}


def _save_b64_in_file(image_b64):
    """
    This function save the image as base64 coding
    :param image_b64: image as base64
    :return: the path of saved image in the temp folder
    """
    data = image_b64.split(",")[1]
    extension = guess_extension(guess_type(image_b64)[0])
    fp = tempfile.NamedTemporaryFile(mode="w+b", prefix="sw_to_detect_", dir="./temp", suffix=extension, delete=False)
    fp.write(base64.b64decode(data))
    image_path = fp.name
    fp.close()
    return image_path


def _request_2_variables(request_form):
    """
    This function convert the request form to useful variables
    :param request_form: request form should has in the case indexGuessedItem, numTry,
                         and theFile. theFile can be base64 image or URL of image
    :return: the variables
    """
    # get the params
    index_guessed_item = int(request_form['indexGuessedItem'])
    num_try = int(request_form['numTry'])
    image = request_form['theFile']
    return image, index_guessed_item, num_try


def _is_url_image(image_url):
    """
    Check if the image exist in the internet -> and the url is valid
    :param image_url: URL of image
    :return: True if image exist, false if not or when happened an error. The error happened when the URL is invalid
    """
    try:
        image_formats = ("image/png", "image/jpeg", "image/jpg")
        r = requests.head(image_url)

        if (r.headers["content-type"] in image_formats) or r.headers["content-type"].startswith('image'):
            return True
        return False
    except Exception:
        return False


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
