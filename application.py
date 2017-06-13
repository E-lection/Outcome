from flask import Flask, render_template

SECRET_KEY = 'development key'
TEMPLATES_AUTO_RELOAD = True

application = Flask(__name__)

@application.route('/')
def index():
    return render_template('index.html')


if __name__ == "__main__":
    application.debug = True
    application.run()
