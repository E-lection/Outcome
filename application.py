from flask import Flask, render_template

import requests

SECRET_KEY = 'development key'
TEMPLATES_AUTO_RELOAD = True

application = Flask(__name__)

outcome_url = 'http://national.eelection.co.uk/outcome/'
turnout_url = 'http://voting.eelection.co.uk/voter_turnout/'

@application.route('/')
def index():
    return render_template('index.html')


@application.route('/outcome/')
def outcome():
    response = requests.get(url=outcome_url)
    return response.text

@application.route('/turnout/')
def turnout():
    response = requests.get(url=turnout_url)
    return response.text


if __name__ == "__main__":
    application.debug = True
    application.run()
