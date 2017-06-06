from flask import Flask
import application
import unittest

class OutcomeTestCase(unittest.TestCase):

    def setUp(self):
        application.application.config['TESTING'] = True
        self.application = application.application.test_client()

    def tearDown(self):
        pass

    def testIndexReturnsResponse(self):
        result = self.application.get('/')
        self.assertEqual(result.status_code, 200)
