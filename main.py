# coding=utf-8
import requests
from yolov5 import YOLOv5
import base64
from flask import Flask, request, render_template
import tempfile
from mimetypes import guess_extension, guess_type

app = Flask(__name__)

# set model params
model_path = "yolov5/weights/best2.pt"
device = "cpu"  # or "cpu"

# init yolov5 model
yolov5 = YOLOv5(model_path, device)

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
        "index": 2,
        "hints": [
            "Es liegt in der Hauptstadt",
            "Das Gebäude hat 4 Türme und eine Kuppel",
            "Das ist das Zentrum des politischen Systems Deutschlands"
        ]
    },

    "Fernseherturm": {
        "name": "Fernseherturm",
        "index": 3,
        "hints": [
            "Es liegt in der Hauptstadt",
            "Es ist 368 Meter hoch",
            "Es liegt am Alexanderplatz"
        ]
    },

    "Rheinau-Hafen": {
        "name": "Rheinau-Hafen",
        "index": 4,
        "hints": [
            "Sie liegt in einer Nordwestlichen Landeshauptstadt ",
            "Sie hat 3 identische Kranhäuser",
            "Sie ist am Rhein",
        ]
    },

    "Alpspitze": {
        "name": "Alpspitze",
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
        "index": 7,
        "hints": [
            "Sie liegt im Bundesstaat, das von Sachsen-Anhalt, Thüringen und Brandenburg gegrenzt ist",
            "Sie ist ein Denkmal einer Schlacht zwischen Napleon gegen Russland und Preußen",
            "Mit 91 Metern Höhe zählt sie zu den größten Denkmälern Europas",
        ]
    },

    "Frauenkirche": {
        "name": "Frauenkirche",
        "index": 8,
        "hints": [
            "Sie liegt in einer südlichen Landeshauptstadt ",
            "Sie hat zwei auffälligetürme",
            "Da kann man beten oder die spätgotische Backsteinbau bewundern",
        ]
    },

    "Kreidefelsen": {
        "name": "Kreidefelsen",
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
}
values = SW_list.values()
values_list = list(values)


@app.route("/detect/image", methods=['POST'])
def detect_image():
    if not request.method == 'POST':
        return
    message_from_client = request.form

    index_guessed_item = int(message_from_client['indexGuessedItem'])
    num_try = int(message_from_client['numTry'])
    image = message_from_client['theFile']

    image_path = save_b64_in_file(image)
    list_detected_class = detect_url(image_path)
    result = check_guess(index_guessed_item, list_detected_class, num_try)

    return result, 200


@app.route("/detect/url", methods=['POST'])
def detect_url():
    if not request.method == 'POST':
        return
    message_from_client = request.form

    index_guessed_item = int(message_from_client['indexGuessedItem'])
    num_try = int(message_from_client['numTry'])
    image_url = message_from_client['imageUrl']

    if not is_url_image(image_url):
        return {"result": False, "message": "Ungültige URL", "isError": True}, 200

    list_detected_class = detect_url(image_url)
    result = check_guess(index_guessed_item, list_detected_class, num_try)

    return result, 200


@app.route("/")
def index():
    return render_template('index.html')


def check_guess(index_guessed_item: int, list_detected_class: list, num_try: int):
    guessed_item = values_list[index_guessed_item - 1]
    if list_detected_class.__contains__(guessed_item["name"]):
        return {"result": True, "message": "Du hast dies Mal mich geschlagen. <br/>😬😡",
                "hint": "Richtig, die Sehenwürdigkeit heißt " + guessed_item["displayName"]}
    elif num_try >= 3:
        return {"result": False, "message": False}

    return {"result": False, "message": "Ich gratuliere mir selbst 😁😁😁, ich habe dich geschlagen. <br/>🥳🥳🥳",
            "hint": guessed_item['hints'][num_try]}


def save_b64_in_file(image_b64):
    data = image_b64.split(",")[1]
    extension = guess_extension(guess_type(image_b64)[0])
    fp = tempfile.NamedTemporaryFile(mode="w+b", prefix="sw_to_detect_", dir="./temp", suffix=extension, delete=False)
    fp.write(base64.b64decode(data))
    image_path = fp.name
    fp.close()
    return image_path


def detect_url(image_url):
    # perform inference
    results = yolov5.predict(image_url)

    # parse results
    predictions = results.pred[0]
    categories = predictions[:, 5]
    list_names = []
    for cat in categories:
        list_names.append(results.names[int(cat)])

    return list_names


def is_url_image(image_url):
    try:
        image_formats = ("image/png", "image/jpeg", "image/jpg")
        r = requests.head(image_url)
        if r.headers["content-type"] in image_formats:
            return True
        return False
    except Exception:
        return False


if __name__ == '__main__':
    app.run(host='0.0.0.0')
