#-*- coding: utf-8 -*-
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class DefaultPage(webapp.RequestHandler):
    
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write('not found')
        self.error(404)

application = webapp.WSGIApplication([('/.*', DefaultPage)], debug=True)


def main():
    run_wsgi_app(application)


if __name__ == "__main__":
    main()
